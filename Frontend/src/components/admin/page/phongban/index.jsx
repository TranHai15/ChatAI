import { useEffect, useState } from "react";
import axiosClient from "../../../../api/axiosClient";
import { showNotification } from "../../../../func";

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState([]);
  const [newDepartment, setNewDepartment] = useState("");
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const fetchUsers = async () => {
    const res = await axiosClient.get("/user/department");
    setDepartments(res.data);
  };
  useEffect(() => {
    fetchUsers();
  }, []);
  const addDepartments = async (name) => {
    const res = await axiosClient.post("/user/department", { name: name });
    if (res.status === 200 || res.status == 201) {
      showNotification("Thêm thành công");
      fetchUsers();
    }
  };
  const deleteDepartments = async (id) => {
    const res = await axiosClient.delete(`/user/department/${id}`);
    if (res.status === 200 || res.status == 201) {
      showNotification("Xóa thành công");
    }
  };
  const updateDepartments = async (id, name) => {
    const res = await axiosClient.post(`/user/departments`, {
      id: id,
      name: name
    });
    if (res.status === 200 || res.status == 201) {
      showNotification("Cập nhật thành công");
    }
  };
  const addDepartment = () => {
    if (!newDepartment.trim()) return;
    addDepartments(newDepartment.trim());
    setDepartments([
      ...departments,
      {
        id: Date.now(),
        ten_phong: newDepartment,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
    setNewDepartment("");
  };

  const deleteDepartment = (id) => {
    deleteDepartments(id);
    setDepartments(departments.filter((dep) => dep.id !== id));
  };

  const startEdit = (id, name) => {
    setEditId(id);
    setEditName(name);
  };

  const updateDepartment = () => {
    updateDepartments(editId, editName);
    setDepartments(
      departments.map((dep) =>
        dep.id === editId
          ? { ...dep, ten_phong: editName, updated_at: new Date() }
          : dep
      )
    );
    setEditId(null);
    setEditName("");
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 border rounded shadow-lg bg-white">
      <h2 className="text-2xl font-bold mb-6 text-center">Quản Lý Phòng Ban</h2>
      <div className="mb-6 flex gap-3">
        <input
          type="text"
          className="border p-3 flex-grow rounded shadow-sm"
          placeholder="Nhập tên phòng ban"
          value={newDepartment}
          onChange={(e) => setNewDepartment(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
          onClick={addDepartment}
        >
          Thêm
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((dep) => (
          <div
            key={dep.id}
            className="border p-4 rounded-lg shadow-md bg-gray-50"
          >
            {editId === dep.id ? (
              <input
                type="text"
                className="border p-2 rounded w-full mb-2"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            ) : (
              <h3 className="text-lg font-semibold text-gray-800">
                {dep.ten_phong}
              </h3>
            )}
            <p className="text-sm text-gray-500">
              Tạo: {dep.created_at.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">
              Cập nhật: {dep.updated_at.toLocaleString()}
            </p>
            <div className="mt-3 flex justify-between">
              {editId === dep.id ? (
                <button
                  className="bg-green-500 text-white px-3 py-1 rounded shadow hover:bg-green-600"
                  onClick={updateDepartment}
                >
                  Lưu
                </button>
              ) : (
                !dep.id == 0 && (
                  <button
                    className="bg-yellow-500 text-white px-3 py-1 rounded shadow hover:bg-yellow-600"
                    onClick={() => startEdit(dep.id, dep.ten_phong)}
                  >
                    Sửa
                  </button>
                )
              )}
              {!dep.id == 0 && (
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded shadow hover:bg-red-600"
                  onClick={() => deleteDepartment(dep.id)}
                >
                  Xóa
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
