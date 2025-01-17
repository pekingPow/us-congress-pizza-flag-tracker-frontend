import React from "react";

import { isUser } from "../components/protectedRoute/permissions";
import LoginSubComponent from "../components/loginSubComponent";
import ProfileView from "../components/profileView";

const Profile = (props) => {
  return isUser() ? <ProfileView /> : <LoginSubComponent />;
};
export default Profile;
