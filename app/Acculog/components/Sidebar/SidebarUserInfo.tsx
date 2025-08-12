import React, { useState, useRef, useEffect } from "react";
// Icons
import { GrPowerShutdown } from "react-icons/gr";
// Route
import { useRouter } from "next/navigation";

interface SidebarUserInfoProps {
  collapsed: boolean;
  userDetails: {
    Firstname: string;
    Lastname: string;
    Company: string;
    Role: string;
    Position: string;
    Status: string;
    Department: string;
    profilePicture?: string;
  };
  agentMode: boolean;
  setAgentMode: (value: boolean) => void;
}

const SidebarUserInfo: React.FC<SidebarUserInfoProps> = ({
  collapsed,
  userDetails,
  agentMode,
  setAgentMode,
}) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const router = useRouter();
  if (collapsed) return null;

  const statusColor = {
    Active: "bg-green-500",
    Inactive: "bg-red-400",
    Locked: "bg-gray-400",
    Busy: "bg-yellow-400",
    "Do not Disturb": "bg-gray-800",
  }[userDetails.Status] || "bg-blue-500";

  useEffect(() => {
    if (!isLoggingOut && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [isLoggingOut]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }

    await new Promise((resolve) => setTimeout(resolve, 3500));
    await fetch("/api/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    sessionStorage.clear();
    router.replace("/Login");
  };

  return (
    <div
      className={`
        relative p-6 dark:bg-gray-900 dark:border-gray-700 flex items-center justify-between flex-shrink-0 overflow-hidden
        md:sticky md:bottom-16 md:z-10
      `}
      style={{ zIndex: 10 }}
    >
      <audio src="/binary-logout-sfx.mp3" ref={audioRef} />

      {isLoggingOut && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-gray-900 backdrop-blur-sm">
          <div className="absolute inset-0 opacity-20 animate-pulse-slow bg-[radial-gradient(circle,_#00ffff33_1px,_transparent_1px)] bg-[length:20px_20px]" />
          <div className="relative w-24 h-24 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-[3px] border-cyan-400 animate-spin-slow shadow-lg shadow-cyan-500/30" />
            <div className="absolute inset-1 rounded-full border-[2px] border-cyan-300 opacity-40 animate-ping" />
            <span className="text-cyan-300 text-[10px] font-mono z-10">
              Logging out...
            </span>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 z-10">
        <div className="relative w-12 h-12">
          <img
            src={userDetails.profilePicture || "/fluxx.png"}
            alt="Avatar"
            className="w-12 h-12 object-cover rounded-full"
          />
          <span
            className={`absolute top-0 right-0 w-4 h-4 rounded-full border-2 border-white dark:border-gray-900 ${statusColor} animate-pulse`}
            title={userDetails.Status}
          />
        </div>

        <div className="text-[10px]">
          <p className="font-bold uppercase">
            {userDetails.Firstname}, {userDetails.Lastname}
          </p>
          <p className="italic">{userDetails.Department}</p>
          <p className="italic">( {userDetails.Position} )</p>
        </div>
      </div>

      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        title="Logout"
        className="ml-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-red-900 transition z-10"
      >
        <GrPowerShutdown size={20} className="text-green-700" />
      </button>
    </div>
  );
};

export default SidebarUserInfo;
