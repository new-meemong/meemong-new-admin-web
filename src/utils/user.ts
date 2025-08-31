import { UserRoleType } from "@/models/users";

export const getUserRole = (
  role: UserRoleType,
): "MODEL" | "DESIGNER" | undefined => {
  if ([1, 2, 3, 4].includes(role) === false) {
    return;
  }

  if (role === 1 || role === 3) {
    return "MODEL";
  } else if (role === 2 || role === 4) {
    return "DESIGNER";
  }
};
