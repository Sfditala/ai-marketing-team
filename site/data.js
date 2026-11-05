window.PROJECT = {
  "slug": "ai-marketing-team",
  "tab": "AI Marketing Team",
  "title": "A marketing team in one Telegram chat",
  "badge": "Demo · fictional café, sample data",
  "idea": "A café owner sends one message, typed or spoken. An Orchestrator works out what they need, hands it to Content, Calendar or Analyst agents, reviews the results and sends back one answer.",
  "problem": "Small café owners know they should post every week, but they rarely have time to write captions, keep a calendar or check which posts brought customers in. Generic AI tools don't know the menu or the offers, so they make things up.",
  "stack": [
    "n8n",
    "OpenAI gpt-5-mini",
    "Pinecone",
    "Gemini Embeddings",
    "Google Sheets",
    "ElevenLabs",
    "Telegram Bot API"
  ],
  "decisions": [
    [
      "The model cannot skip the owner's approval",
      "Saving to the calendar sits behind a Telegram approve or decline node, so a prompt can't talk its way past it."
    ],
    [
      "Orchestrator, not a router",
      "It can run two tasks from one message, such as writing a post and scheduling it, and review each result before replying."
    ],
    [
      "Code decides what must be exact",
      "Reply language, the owner allowlist and calendar conflicts are computed in code. Models handle understanding and writing."
    ],
    [
      "Prices come only from RAG",
      "If a fact isn't in the knowledge base after two searches, the agent says it's missing."
    ]
  ],
  "lessons": [
    [
      "The model answered English questions in Arabic, because the knowledge base is Arabic.",
      "Reply language is now computed in code and passed to every agent."
    ],
    [
      "One long search returned platform rules instead of a product's price.",
      "The Content Agent runs short, separate searches for each topic."
    ],
    [
      "A technical error was reported to the owner as \"you declined\".",
      "The Calendar Agent now separates approved, declined and error."
    ]
  ],
  "traces": [
    {
      "label": "Write an Instagram post",
      "ask": "اكتبلي بوست عن الكولد برو",
      "steps": [
        [
          "Telegram Trigger",
          "The owner's message arrives."
        ],
        [
          "Allowlist",
          "Checked first: is this the owner? Anyone else stops here."
        ],
        [
          "Input Type",
          "Text, voice or something else. This one is text."
        ],
        [
          "Prepare Message",
          "Code sets the reply language and normalises the message."
        ],
        [
          "Orchestrator",
          "Classifies the request as content and delegates it word for word."
        ],
        [
          "content_agent",
          "Plans short, separate searches: product, platform rules, offers and tone."
        ],
        [
          "cafe_knowledge",
          "Vector search in Pinecone. Prices can only come from here."
        ],
        [
          "content_agent",
          "Writes the post in the brand's voice."
        ],
        [
          "Orchestrator",
          "Reviews the result against the request, without changing prices or dates."
        ],
        [
          "Is Voice?",
          "The owner typed, so the reply is text."
        ],
        [
          "Send Reply",
          "The post arrives, with one follow-up question."
        ]
      ]
    },
    {
      "label": "Schedule it, with approval",
      "ask": "جدوله يوم الخميس الساعة 7",
      "steps": [
        [
          "Telegram Trigger",
          "The owner replies to the post."
        ],
        [
          "Allowlist",
          "Same check, on every message."
        ],
        [
          "Input Type",
          "Text again."
        ],
        [
          "Prepare Message",
          "Language and context are set."
        ],
        [
          "Orchestrator",
          "Uses memory to connect \"it\" to the last post, then delegates scheduling."
        ],
        [
          "calendar_agent",
          "Turns \"Thursday at 7\" into an exact date and time."
        ],
        [
          "get_schedule",
          "Reads the current calendar from Google Sheets."
        ],
        [
          "check_conflict",
          "Code rejects past dates and taken slots."
        ],
        [
          "Calendar Approval",
          "Execution pauses here. The owner gets Approve and Decline buttons."
        ],
        [
          "add_to_calendar",
          "Runs only after Approve. The model has no other way to write this row."
        ],
        [
          "calendar_agent",
          "Reports one of three outcomes: approved, declined or error."
        ],
        [
          "Orchestrator",
          "Only calls it scheduled if the agent confirmed the save."
        ],
        [
          "Is Voice?",
          "Text in, text out."
        ],
        [
          "Send Reply",
          "The owner sees the confirmed slot."
        ]
      ]
    },
    {
      "label": "Ask by voice about results",
      "ask": "🎙️ أي بوست جاب طلبات أكتر؟",
      "steps": [
        [
          "Telegram Trigger",
          "A voice note arrives."
        ],
        [
          "Allowlist",
          "Owner only."
        ],
        [
          "Input Type",
          "This time the voice route."
        ],
        [
          "Get Voice File",
          "Downloads the audio from Telegram."
        ],
        [
          "Transcribe Voice",
          "ElevenLabs Scribe turns it into text and detects the language."
        ],
        [
          "Prepare Message",
          "Marks it as voice, so the reply will be voice too."
        ],
        [
          "Orchestrator",
          "Classifies it as a report."
        ],
        [
          "analyst_agent",
          "Must read the sheet first. It never answers from memory."
        ],
        [
          "get_metrics",
          "Reads reach, clicks, likes and orders."
        ],
        [
          "calculator",
          "Used for every figure, even simple ones."
        ],
        [
          "analyst_agent",
          "Answers and names the posts it used."
        ],
        [
          "Orchestrator",
          "Reviews the answer and keeps the numbers exactly as written."
        ],
        [
          "Is Voice?",
          "Voice in, so voice out."
        ],
        [
          "Text to Speech",
          "Hashtags and emojis are stripped, then ElevenLabs speaks it."
        ],
        [
          "Send Voice Reply",
          "The answer arrives as audio."
        ]
      ]
    },
    {
      "label": "A stranger finds the bot",
      "ask": "مرحبا، مين انت؟",
      "steps": [
        [
          "Telegram Trigger",
          "A message from someone who isn't the owner."
        ],
        [
          "Allowlist",
          "The check fails before any AI model runs, so it costs nothing."
        ],
        [
          "Send Refusal",
          "A short, polite refusal. The workflow ends."
        ]
      ]
    },
    {
      "label": "Update the knowledge base",
      "ask": "📄 offers.md",
      "steps": [
        [
          "Upload Knowledge Form",
          "The owner uploads brand, menu or offer files in a simple form."
        ],
        [
          "Default Data Loader",
          "Reads the file text."
        ],
        [
          "Gemini Embeddings",
          "Turns each chunk into a vector."
        ],
        [
          "Pinecone - Insert",
          "Stores it. The Content Agent can search it straight away."
        ]
      ]
    }
  ],
  "setup": [
    "Connect Telegram, OpenAI, Pinecone, Gemini, Google Sheets and ElevenLabs credentials.",
    "Create a Pinecone index whose dimensions match your Gemini embedding model.",
    "Create a sheet with three tabs: content_calendar, best_times and campaign_metrics.",
    "Replace YOUR_TELEGRAM_USER_ID, YOUR_TELEGRAM_CHAT_ID and YOUR_GOOGLE_SHEET_ID.",
    "Upload your knowledge files through the form, then publish."
  ],
  "signature": {
    "title": "Who gets to decide?",
    "sub": "In this system, the model doesn't decide everything. Pick an action to see who controls it.",
    "style": "cols3",
    "prompt": "Pick an action above.",
    "items": [
      {
        "label": "Write the caption",
        "tag": "AI",
        "trace": 0,
        "text": "The Content Agent writes it in the brand's voice and follows each platform's rules."
      },
      {
        "label": "Quote a price",
        "tag": "Knowledge base",
        "trace": 0,
        "text": "Prices can only come from RAG. If a fact is still missing after two searches, the agent says so."
      },
      {
        "label": "Save a post to the calendar",
        "tag": "The owner",
        "trace": 1,
        "text": "The workflow pauses and sends Approve and Decline buttons. Nothing is saved without Approve."
      },
      {
        "label": "Spot a calendar clash",
        "tag": "Code",
        "trace": 1,
        "text": "A code tool rejects past dates and taken slots. The model can't overrule it."
      },
      {
        "label": "Calculate engagement",
        "tag": "Calculator tool",
        "trace": 2,
        "text": "Every figure goes through the calculator, and the answer names the posts it used."
      },
      {
        "label": "Let a stranger in",
        "tag": "Code",
        "trace": 3,
        "text": "The allowlist runs before any model, so a stranger gets a refusal and costs nothing."
      }
    ]
  }
};
