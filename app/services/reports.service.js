/** reports modals */
let userRolesReportModal;
let appAccessReportModal;

document.addEventListener("DOMContentLoaded", () => {
  userRolesReportModal = new bootstrap.Modal(
    document.getElementById("userRolesReportModal")
  );
  appAccessReportModal = new bootstrap.Modal(
    document.getElementById("appAccessReportModal")
  );
});

async function loadUserReportByRole(event) {
  event.preventDefault();

  const role = document.getElementById("report_roleName").value;

  try {
    const response = await fetch("/api/getUsersByRole", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role }),
    });

    if (!response.ok) {
      throw new Error("Failed to get users");
    }

    const data = await response.json();

    // Process tuples to get user table
    const userMap = new Map();

    data.tuples.forEach((tuple) => {
      const { key } = tuple;

      const userId = key.user.replace("user:", "");
      const roleId = key.object.replace("role:", "");

      if (!userMap.has(userId)) {
        userMap.set(userId, roleId);
      }
    });

    const tableBody = document.getElementById("user-roles-report-table-body");
    tableBody.innerHTML = ""; // Clear existing table content

    // Convert the map to array and sort by userId ID
    Array.from(userMap.entries())
      .sort(([permA], [permB]) => permA.localeCompare(permB))
      .forEach(([userId, role]) => {
        const row = tableBody.insertRow();
        const cell1 = row.insertCell(0);
        const cell2 = row.insertCell(1);

        cell1.textContent = userId;
        cell2.textContent = role;
      });

    userRolesReportModal.show();
  } catch (error) {
    console.error("Error fetching users:", error);
    alert("Failed to fetch users. Please try again.");
  }
}

async function loadAppAccessReport(event) {
  event.preventDefault();

  const appId = document.getElementById("report_appName").value;

  try {
    const response = await fetch(`/api/apps/${appId}/users`);
    const users = await response.json();

    const modalBody = document.getElementById("app-access-report-table-body");
    modalBody.innerHTML = "";

    users.forEach((user) => {
      const row = modalBody.insertRow();
      row.innerHTML = `
        <td>${user.id}</td>
        <td>${user.credentials?.userName || user.profile?.login}</td>
        <td>${user.status}</td>
      `;
    });

    appAccessReportModal.show();
  } catch (error) {
    console.error("Error fetching app access report:", error);
    alert("Failed to fetch data. Please try again.");
  }
}

export const reportsService = { loadUserReportByRole, loadAppAccessReport };
