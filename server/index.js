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
import axios from 'axios';

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
  OKTA_API_TOKEN,
  FGA_STORE_ID,
  FGA_CLIENT_ID,
  FGA_CLIENT_SECRET,
  FGA_API_URL,
  OPENFGA_STORE_ID = '01HNB6M5ETZMYN0MVJA2EQDWT7',
  OPENFGA_CLIENT_ID = 'uezdRJVC8uO7i1CCPIGeFPTWTpS2Rn99',
  OPENFGA_CLIENT_SECRET = '5HoVOW5vM3u5JWEguW_gCRdv9FjkXGXMpLE7Uu0bB0VN9gkuIp9HF5oxvutMpjD9',
  OPENFGA_API_URL = 'https://api.us1.fga.dev',
  OPENFGA_API_TOKEN_ISSUER,
  OPENFGA_API_AUDIENCE,
  OPENFGA_MODEL,
  OKTA_ORG_URL,
} = process.env;

const permissions = Array.isArray(AUTH_PERMISSIONS)
  ? AUTH_PERMISSIONS
  : AUTH_PERMISSIONS.split(' ');

const app = express();

app.use(cors({ origin: '*' }));
app.use(morgan('dev'));
app.use(helmet());
app.use(express.static(join(__dirname, 'public')));
app.use(express.json());

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

// Organizations API endpoints
app.get('/api/organizations', async (req, res) => {
  try {
    const response = await axios.post(
      'https://usps-spa.workflows.oktapreview.com/api/flo/b24cec17923d893a2ec2c65c52aa9672/invoke',
      {} // Add empty body for POST request
    );
    console.log(response);
    if (!response.data || !response.data.values) {
      throw new Error('Invalid response format from organizations API');
    }

    res.json(response.data.values);
  } catch (error) {
    console.error('Organizations API error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch organizations',
      error: error.message,
    });
  }
});

app.post('/api/organizations', async (req, res) => {
  try {
    const response = await axios.post(
      'https://usps-spa.workflows.oktapreview.com/api/flo/d75dda1cddb48c5d84c6ad41f36058ca/invoke?clientToken=607dee9156f5a28931abd00cb23a397d5ff516c4bdc787e329df2b033c06f84f',
      {}
    );

    if (!response.data) {
      throw new Error('No data received from create organization API');
    }

    res.json(response.data);
  } catch (error) {
    console.error('Create organization error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create organization',
      error: error.message,
    });
  }
});

// Okta Apps API endpoints
app.get('/api/apps', async (req, res) => {
  try {
    const response = await axios.get(`${OKTA_ORG_URL}/api/v1/apps`, {
      headers: {
        Authorization: `SSWS ${OKTA_API_TOKEN}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error('Apps API error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error.message,
    });
  }
});

app.get('/api/apps/:appId/users', async (req, res) => {
  try {
    const response = await axios.get(
      `${OKTA_ORG_URL}/api/v1/apps/${req.params.appId}/users`,
      {
        headers: {
          Authorization: `SSWS ${OKTA_API_TOKEN}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('App users API error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application users',
      error: error.message,
    });
  }
});

app.get('/api/apps/:appId/roles', async (req, res) => {
  const userTuple = {
    user: `application:${req.params.appId}`,
    relation: 'assignedTo',
    type: 'role'
  };

  try {
    const fgaResponse = await listObjects(userTuple);
    console.log(fgaResponse);
    res.json(fgaResponse.objects);
  } catch (error) {
    console.error('App roles API error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application roles',
      error: error.message || 'Unknown error occurred',
    });
  }
});

// List All Permissions 
app.get('/api/permissions', async (req, res) => {
  try {
    const token = await getBearerToken();
    const response = await axios.post(
      `${OPENFGA_API_URL}/stores/${OPENFGA_STORE_ID}/read`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.data) {
      throw new Error('No data received from OpenFGA API');
    }

    res.json(response.data);
  } catch (error) {
    console.error('Permissions API error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch permissions',
      error: error.message || 'Unknown error occurred',
    });
  }
});

app.post('/api/permissions/assign', async (req, res) => {
  const { permissionId, roleId } = req.body;
  console.log('Creating permission:', permissionId, roleId);
  if (!permissionId || !roleId) {
    return res.status(400).json({
      success: false,
      message: 'Permission ID and Role ID are required',
    });
  }

  try {
    const token = await getBearerToken();
    await axios.post(
      `${OPENFGA_API_URL}/stores/${OPENFGA_STORE_ID}/write`,
      {
        writes: {
          tuple_keys: [{
            user: `role:${roleId}`,
            relation: 'containedIn',
            object: `permission:${permissionId}`
          }]
        }
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({
      success: true,
      message: 'Permission assigned successfully'
    });
  } catch (error) {
    console.error('Permission assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign permission',
      error: error.message || 'Unknown error occurred',
    });
  }
});

async function listObjects(userTuple) {
  try {
    const token = await getBearerToken();
    const response = await axios.post(
      `${OPENFGA_API_URL}/stores/${OPENFGA_STORE_ID}/list-objects`,
      userTuple,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error listing objects:', error);
    throw error;
  }
}

async function readPermission(roleTuple) {
  try {
    const token = await getBearerToken();
    console.log(roleTuple);
    const response = await axios.post(
      `${OPENFGA_API_URL}/stores/${OPENFGA_STORE_ID}/read`,
      roleTuple,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error listing permissions:', error);
    throw error;
  }
}

async function getBearerToken() {
  try {
    const response = await axios.post('https://fga.us.auth0.com/oauth/token', {
      client_id: OPENFGA_CLIENT_ID,
      client_secret: OPENFGA_CLIENT_SECRET,
      grant_type: 'client_credentials',
      audience: 'https://api.us1.fga.dev/',
    });
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting bearer token:', error);
    throw error;
  }
}

export const handler = app;