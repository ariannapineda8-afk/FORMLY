"use client";

import { createContext, useContext } from "react";

const RoleContext = createContext({ role: "admin", email: "" });

export function RoleProvider({ role, email, children }) {
  return <RoleContext.Provider value={{ role, email }}>{children}</RoleContext.Provider>;
}

export function useRole() {
  return useContext(RoleContext);
}
