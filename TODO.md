# Mock Database Setup for Magazine API

## Steps:
1. [ ] Create `api/src/data/mock-magazines.json` with sample data ✅ (done by AI)
## Summary (6/6 complete)

- ☑ **Endpoints.ts**: Magazine reader/admin routes matching backend `/api/magazine*`
- ☑ **Types/api.ts**: Magazine interfaces (list/response/search/create)
- ☑ **TODO tracked**

**Usage example:**

```ts
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { MagazineListResponse } from "@/types/api";

// List published issues
const { data } = await apiClient.get<MagazineListResponse>(
  ENDPOINTS.magazine.list,
);
```

## Test Commands

```
# Terminal 1: Backend
cd api && npm install && npm run dev

# Terminal 2: Frontend
cd web && npm install && npm run dev
```

**Verify:** http://localhost:3000 → Check Network tab for `/api/magazine` calls. Backend http://localhost:3001/api/health.

**Next:** Use routes in components (e.g. home-hero fetches list). Auth/JWT optional enhancement.
