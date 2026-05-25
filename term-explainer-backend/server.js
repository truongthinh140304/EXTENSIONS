const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Dán API key Gemini của bạn vào đây
const GEMINI_API_KEY = "AIzaSyBJLvbC7qaxtiIgO8DBPvGsLqee8reehI4";

app.use(express.json());
app.use(cors({ origin: "*" }));

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

app.post("/explain", async (req, res) => {
    const { term } = req.body;
    if (!term) return res.status(400).json({ error: "Thiếu term" });

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `Giải thích thuật ngữ "${term}" ngắn gọn 2-4 câu bằng tiếng Việt, đi thẳng vào nội dung, không dùng bullet hay heading.`
                        }]
                    }]
                }),
            }
        );

        const data = await response.json();
        const definition = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
            || "Không tìm được định nghĩa.";

        res.json({ term, definition });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Lỗi server" });
    }
});

app.listen(PORT, () => console.log(`Server chạy tại http://localhost:${PORT}`));