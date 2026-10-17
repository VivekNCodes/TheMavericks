import Link from "next/link";
import { ArrowLeft, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-krishi-50 text-krishi-700 border border-krishi-200 mb-4 shadow-sm">
        <FileQuestion className="h-8 w-8 stroke-[1.8]" />
      </div>
      <h2 className="text-2xl font-black text-slate-900 tracking-tight">
        Page Not Found
      </h2>
      <p className="text-xs sm:text-sm text-slate-500 mt-2 mb-6 leading-relaxed">
        The agricultural intelligence view or marketplace listing you requested does not exist or has been relocated.
      </p>
      <Link href="/">
        <Button
          variant="primary"
          size="md"
          leftIcon={<ArrowLeft className="h-4 w-4" />}
        >
          Return to Dashboard
        </Button>
      </Link>
    </div>
  );
}
