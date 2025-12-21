import { exec } from "child_process";
import { NextResponse } from "next/server";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function POST() {
    try {
        // Run vitest in a sub-process.
        // We use 'npx vitest run' to ensure we use the local installation.
        // --reporter=json ensures we get machine-readable output.
        const { stdout, stderr } = await execAsync("npx vitest run --reporter=json", {
            cwd: process.cwd(), // Ensure we run from project root
        });

        // Vitest writes the JSON result to stdout
        const results = JSON.parse(stdout);

        return NextResponse.json({ success: true, results });
    } catch (error) {
        // Vitest exits with code 1 if tests fail, so execAsync throws.
        // We need to parse the stdout even if it fails to get the test details.
        if (error.stdout) {
            try {
                const results = JSON.parse(error.stdout);
                return NextResponse.json({ success: false, results });
            } catch (parseError) {
                return NextResponse.json(
                    { success: false, error: "Failed to parse test results", output: error.stdout },
                    { status: 500 }
                );
            }
        }

        console.error("Test execution failed:", error);
        return NextResponse.json(
            { success: false, error: "Failed to execute tests", details: error.message },
            { status: 500 }
        );
    }
}
