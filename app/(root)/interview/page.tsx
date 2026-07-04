import React from 'react'
import Agent from '@/components/agent'
import { getRequiredUser } from "@/lib/actions/auth.action";

const Page = async () => {
  const user = await getRequiredUser();

  return (
    <>
      <h3>Interview generation</h3>

      <Agent
        userName={user.name}
        userId={user.id}
       //profileImage={user?.profileURL}
        type="generate"
      />
    </>
  );
};

export default Page;


