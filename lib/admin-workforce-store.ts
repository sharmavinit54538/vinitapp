import { AdminDepartmentRecord } from '@/src/features/admin/departments/departmentsThunk';
import { DEFAULT_ADMIN_DEPARTMENTS } from '@/src/features/admin/departments/departmentsSlice';
import { AdminEmployeeRecord } from '@/src/features/admin/employees/employeesThunk';
import { DEFAULT_ADMIN_EMPLOYEES } from '@/src/features/admin/employees/employeesSlice';

const globalStore = globalThis as unknown as {
  __ofc360AdminDepts?: AdminDepartmentRecord[];
  __ofc360AdminEmployees?: AdminEmployeeRecord[];
};

export function getAdminDepartmentsStore(): AdminDepartmentRecord[] {
  if (!globalStore.__ofc360AdminDepts) {
    globalStore.__ofc360AdminDepts = [...DEFAULT_ADMIN_DEPARTMENTS];
  }
  return globalStore.__ofc360AdminDepts;
}

export function setAdminDepartmentsStore(items: AdminDepartmentRecord[]): void {
  globalStore.__ofc360AdminDepts = items;
}

export function getAdminEmployeesStore(): AdminEmployeeRecord[] {
  if (!globalStore.__ofc360AdminEmployees) {
    globalStore.__ofc360AdminEmployees = [...DEFAULT_ADMIN_EMPLOYEES];
  }
  return globalStore.__ofc360AdminEmployees;
}

export function setAdminEmployeesStore(items: AdminEmployeeRecord[]): void {
  globalStore.__ofc360AdminEmployees = items;
}
