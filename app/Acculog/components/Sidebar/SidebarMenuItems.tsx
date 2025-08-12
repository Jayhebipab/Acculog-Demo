// Icons
import { CiMemoPad } from "react-icons/ci";

const getMenuItems = (userId: string | null = "") => [
  {
    title: "Activities",
    icon: CiMemoPad,
    subItems: [
      {
        title: "Activity Logs",
        description: "View your recent activity records and task updates",
        href: `/Acculog/Attendance/Activity/ActivityLogs${userId ? `?id=${encodeURIComponent(userId)}` : ""}`,
      }
    ],
  },
];

export default getMenuItems;
