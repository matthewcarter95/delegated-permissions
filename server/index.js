import * as dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import config from '../config.js';
import jwt from 'jsonwebtoken';
import { OpenFgaApi } from '@openfga/sdk';

export const loadEnv = (options) => {
  if (existsSync('.env.local')) {
    dotenv.config({ path: `.env.local`, ...options });
  }

  dotenv.config(options);
};

loadEnv();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { auth, server } = config || {};

const {
  SERVER_AUDIENCE: audience = server?.audience ??
    auth?.audience ??
    auth?.authorizationParams?.audience ??
    'api://default',
  SERVER_AUTH_PERMISSIONS: AUTH_PERMISSIONS = server?.permissions || [
    'AuthRocks',
  ],
  OPENFGA_API_URL,
  OPENFGA_STORE_ID,
  OPENFGA_API_TOKEN
} = process.env;

// Initialize OpenFGA client
const fgaClient = new OpenFgaApi({
  apiUrl: OPENFGA_API_URL,
  storeId: OPENFGA_STORE_ID,
  apiToken: OPENFGA_API_TOKEN
});

const permissions = Array.isArray(AUTH_PERMISSIONS)
  ? AUTH_PERMISSIONS
  : AUTH_PERMISSIONS.split(' ');

const app = express();

app.use(cors({ origin: '*' }));
app.use(morgan('dev'));
app.use(helmet());
app.use(express.static(join(__dirname, 'public')));

// Simple token extraction middleware
const extractToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'No token provided',
    });
  }
  req.token = authHeader.split(' ')[1];
  next();
};

// Simple permissions check middleware
const checkPermissions = (req, res, next) => {
  try {
    const decoded = jwt.decode(req.token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }

    const userPermissions = decoded.permissions || [];
    const hasRequiredPermissions = permissions.every((permission) =>
      userPermissions.includes(permission)
    );

    if (!hasRequiredPermissions) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
    }
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token verification failed',
    });
  }
};

app.get('/api/scoped', extractToken, checkPermissions, (req, res) =>
  res.json({
    success: true,
    message:
      'This is the API response. Your access token has valid permissions!',
  })
);

// New route to list containedIn relations
app.get('/api/relations/contained-in', extractToken, checkPermissions, async (req, res) => {
  try {
    const { roleType = 'role' } = req.query;
    
    const response = await fgaClient.read({
      tupleKey: {
        object: roleType,
        relation: "containedIn",
        user: "permission"
      }
    });

    res.json({
      success: true,
      relations: response.tuples
    });
  } catch (error) {
    console.error('OpenFGA Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching relations',
      error: error.message
    });
  }
});

export const handler = app;