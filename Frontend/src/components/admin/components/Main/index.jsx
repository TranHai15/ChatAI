import "./style.css";
import { Route, Routes } from "react-router-dom";
import NotFound from "../../../notFound";
import Account from "../../page/account";
import Dashboard from "../../page/dashboard";

import FileList from "../../page/file";
import UserProfile from "../../page/account/viewAccount";
import CreateAccount from "../../page/account/createAccount";
import Nof from "../../page/nof";
import DepartmentManagement from "../../page/phongban";
export default function Main() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/users" element={<Account />} />
        <Route path="/file" element={<FileList />} />
        <Route path="/editUser/:id" element={<UserProfile />} />
        <Route path="/create" element={<CreateAccount />} />
        <Route path="/nof" element={<Nof />} />
        <Route path="/phong" element={<DepartmentManagement />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
