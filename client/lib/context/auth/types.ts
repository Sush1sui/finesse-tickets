export type User = {
  id: string;
  name: string;
  email: string;
  image: string;
  discordId: string;
};

export type AuthContext = {
  user: User | null;
  authLoading: boolean;
  login: () => void;
  logout: () => void;
};
