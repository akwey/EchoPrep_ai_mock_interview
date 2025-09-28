// import Link from "next/link";
// import Image from "next/image";
// import { ReactNode } from "react";
// import { redirect } from "next/navigation";

// import { isAuthenticated } from "@/lib/actions/auth.action";

// const Layout = async ({ children }: { children: ReactNode }) => {
//   const isUserAuthenticated = await isAuthenticated();
//   if (!isUserAuthenticated) redirect("/sign-in");

//   return (
//     <div className="root-layout">
//       <nav>
//         <Link href="/" className="flex items-center gap-2">
//           <Image src="/logo.svg" alt="MockMate Logo" width={38} height={32} />
//           <h2 className="text-primary-100">EchoPrep</h2>
//         </Link>
//       </nav>

//       {children}
//     </div>
//   );
// };

// export default Layout;

import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { isAuthenticated, getCurrentUser } from "@/lib/actions/auth.action";
import LogoutButton from "@/components/logout";

const Layout = async ({ children }: { children: ReactNode }) => {
  // ✅ Check if user is authenticated
  const isUserAuthenticated = await isAuthenticated();
  if (!isUserAuthenticated) redirect("/sign-in");

  // ✅ Get user info from server
  const user = await getCurrentUser();

  return (
    <div className="root-layout">
      {/* Navbar */}
      <nav className="flex justify-between items-center p-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="EchoPrep Logo" width={38} height={32} />
          <h2 className="text-primary-100">EchoPrep</h2>
        </Link>

        <div className="flex items-center gap-4">
          {/* Hi username from server */}
     
          <p>
            <span className="font-bold">Hello ,</span>
     <span className="font-extrabold">{user?.name || "User"}! </span>
  </p>
          {/* Client-side Logout button */}
          <LogoutButton />
        </div>
      </nav>

      {children}
    </div>
  );
};

export default Layout;
