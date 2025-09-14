
import '@auth/core/types'

declare module '@auth/core/types' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
    };
  }

  interface JWT {
    id: string;
    email?: string | null;
  }
}
