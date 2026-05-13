├── src/
│   ├── config/              ← Konfigurasi database & app
│   ├── controllers/         ← Business logic handlers
│   ├── repositories/        ← Data access layer (database queries)
│   ├── services/            ← Business services (sudah ada)
│   ├── routes/              ← API routes definitions
│   ├── middlewares/         ← Express middlewares
│   │   └── auth/            ← Authentication middlewares
│   ├── validators/          ← Data validation (schema Joi)
│   ├── exceptions/          ← Custom error classes (sudah ada)
│   ├── utils/               ← Utility functions (sudah ada)
│   ├── constants/           ← Application constants
│   └── server.js            ← Entry point
├── migrations/              ← Database migrations
├── docs/                    ← API documentation
├── package.json
├── .env.example             ← Environment template
├── .gitignore               ← Git ignore rules
└── README.md  