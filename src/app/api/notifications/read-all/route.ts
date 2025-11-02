// // src/app/api/notifications/read-all/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { getServerSession } from "next-auth/next";
// import { authOptions } from "@/lib/auth/auth";
// import { markAllNotificationsAsRead } from "@/lib/services/notification-service";

// export async function POST(req: NextRequest) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session?.user?.id) {
//       return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//     }

//     const result = await markAllNotificationsAsRead(session.user.id);

//     if (result.success) {
//       return NextResponse.json({ message: "All notifications marked as read" });
//     } else {
//       return NextResponse.json({ message: "Failed to mark all as read" }, { status: 500 });
//     }
//   } catch (error) {
//     console.error("Error marking all notifications as read:", error);
//     return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
//   }
// }

// src/app/api/notifications/read-all/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth";
import { markAllNotificationsAsRead } from "@/lib/services/notification-service";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const result = await markAllNotificationsAsRead(session.user.id);

    if (result.success) {
      return NextResponse.json({ message: "All notifications marked as read" });
    } else {
      return NextResponse.json({ message: "Failed to mark all as read" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
