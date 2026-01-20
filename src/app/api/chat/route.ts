import { groq, MODEL_NAME } from "@/lib/groq";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json(
                { error: "Messages are required and must be an array." },
                { status: 400 }
            );
        }

        const response = await groq.chat.completions.create({
            model: MODEL_NAME,
            messages: messages,
            stream: true,
        });

        // Create a ReadableStream from the Groq stream
        const stream = new ReadableStream({
            async start(controller) {
                for await (const chunk of response) {
                    const content = chunk.choices[0]?.delta?.content || "";
                    if (content) {
                        controller.enqueue(new TextEncoder().encode(content));
                    }
                }
                controller.close();
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        });
    } catch (error) {
        console.error("Groq API Error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "An error occurred during the Groq API call." },
            { status: 500 }
        );
    }
}
