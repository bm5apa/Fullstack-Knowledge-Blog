import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import NavBar from "../components/NavBar";
import PostForm from "../components/PostForm";

export default async function NewPostPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/api/auth/signin?callbackUrl=/new");

  return (
    <main>
      <NavBar />
      <div className="mx-auto max-w-3xl space-y-4 p-4">
        <h1 className="text-2xl font-bold">建立新文章</h1>
        <PostForm />
      </div>
    </main>
  );
}
