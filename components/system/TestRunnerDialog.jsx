"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, FlaskConical, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export function TestRunnerDialog({ children }) {
    const [isRunning, setIsRunning] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [isOpen, setIsOpen] = useState(false);

    const runTests = async () => {
        setIsRunning(true);
        setResults(null);
        setError(null);

        try {
            const response = await fetch("/api/run-tests", { method: "POST" });
            const data = await response.json();

            if (data.results) {
                setResults(data.results);
            } else if (data.error) {
                setError(data.error);
            }
        } catch (err) {
            setError("Failed to contact server.");
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FlaskConical className="h-5 w-5" />
                        System Verification
                    </DialogTitle>
                    <DialogDescription>
                        Run full system diagnostic tests (Unit & Integration) directly from the environment.
                        <br />
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded mt-1 inline-block">
                            Note: Requires server-side dev dependencies.
                        </span>
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b pb-4">
                        <div className="flex gap-4">
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">Total Tests</p>
                                <p className="text-2xl font-bold">{results?.numTotalTests || "-"}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">Passed</p>
                                <p className="text-2xl font-bold text-green-500">{results?.numPassedTests || "-"}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">Failed</p>
                                <p className="text-2xl font-bold text-red-500">{results?.numFailedTests || "-"}</p>
                            </div>
                        </div>

                        <Button onClick={runTests} disabled={isRunning} variant={results ? "outline" : "default"}>
                            {isRunning ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Running Diagnostics...
                                </>
                            ) : (
                                "Run Verification"
                            )}
                        </Button>
                    </div>

                    <ScrollArea className="flex-1 bg-muted/30 rounded-md border p-4">
                        {error && (
                            <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-4 rounded-lg">
                                <AlertTriangle className="h-5 w-5" />
                                <p>{error}</p>
                            </div>
                        )}

                        {!isRunning && !results && !error && (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-2 opacity-60">
                                <FlaskConical className="h-12 w-12" />
                                <p>Ready to run verification suite</p>
                            </div>
                        )}

                        {results && (
                            <div className="space-y-4">
                                {results.testResults?.map((suite) => (
                                    <div key={suite.name} className="bg-card rounded-lg border p-4 shadow-sm">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-semibold text-sm truncate max-w-[400px]" title={suite.name}>
                                                {suite.name.split("/").pop()}
                                            </h4>
                                            <Badge variant={suite.status === "passed" ? "default" : "destructive"}>
                                                {suite.status}
                                            </Badge>
                                        </div>
                                        <div className="space-y-2">
                                            {suite.assertionResults.map((test) => (
                                                <div key={test.title} className="flex items-start gap-2 text-sm">
                                                    {test.status === "passed" ? (
                                                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                    ) : (
                                                        <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                                                    )}
                                                    <span className={cn(test.status === "failed" && "font-medium text-destructive")}>
                                                        {test.title}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    );
}
