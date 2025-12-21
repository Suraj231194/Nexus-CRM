"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function Error({ error, reset }) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("Runtime Error:", error);
    }, [error]);

    return (
        <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Something went wrong!</h2>
                <p className="max-w-[500px] text-muted-foreground">
                    We encountered an unexpected error. Our team has been notified.
                </p>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" onClick={() => window.location.href = "/"}>
                    Go Home
                </Button>
                <Button onClick={() => reset()}>Try again</Button>
            </div>
        </div>
    );
}
