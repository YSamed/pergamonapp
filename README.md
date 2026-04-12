# PergamonApp

This repository now contains a standard React Native folder structure with a sample `test` feature.

## Structure

```text
.
├── App.tsx
├── app.json
├── babel.config.js
├── index.js
├── tsconfig.json
└── src
    ├── assets
    │   ├── fonts
    │   ├── icons
    │   └── images
    ├── components
    ├── constants
    ├── features
    │   └── test
    ├── hooks
    ├── navigation
    ├── screens
    ├── services
    ├── store
    ├── theme
    ├── types
    └── utils
```

## Notes

- `App.tsx` starts the app and renders `AppNavigator`.
- `src/navigation/AppNavigator.tsx` is kept dependency-free for now and loads `TestScreen`.
- `src/features/test` shows how to group feature-specific UI, constants, and types together.
- `src/screens/TestScreen` shows how a screen can consume feature modules and shared theme files.
