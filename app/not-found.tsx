import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-xl text-muted-foreground">Page not found</p>
      <Link href="/dashboard" className="text-primary hover:underline">
        Return to Dashboard
      </Link>
    </div>
  );
}
