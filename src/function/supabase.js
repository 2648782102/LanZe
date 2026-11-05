import { createClient } from "@supabase/supabase-js";
import { runtimeConfig, hasSupabase } from "../config/runtime.js";
import {
  mockCollectionPoems,
  mockCustomPoems,
  mockDeleteAccount,
  mockFindUser,
  mockGetUserProfile,
  mockGetUsers,
  mockSetPassword,
  mockUpdateProfile,
} from "../services/mockApi.js";

const emptyResponse = (data = [], error = null) => ({ data, error, status: 200 });

const createLocalAdapter = () => {
  const listUsers = () =>
    mockGetUsers().map((user) => ({
      id: user.id,
      user: user.username,
      username: user.username,
      password: user.password,
      user_name: user.user_name,
      head_img: user.head_img,
      intro: user.intro,
    }));

  const query = (table, operation, payload) => {
    const builder = {
      select: () => Promise.resolve(
        emptyResponse(
          table === "us_er"
            ? listUsers()
            : table === "user_message"
              ? [mockGetUserProfile().data]
              : table === "customgushici"
                ? mockCustomPoems().data
                : mockCollectionPoems({ address: table }).data,
        ),
      ),
      insert: () => Promise.resolve(emptyResponse(payload ? [payload] : [])),
      update: () => {
        if (table === "user_message") mockUpdateProfile(payload || {});
        if (table === "us_er" && payload?.password) {
          mockSetPassword(payload.user || payload.username, payload.password);
        }
        return Promise.resolve(emptyResponse(payload ? [payload] : []));
      },
      delete: async () => {
        if (table === "us_er") {
          const condition = typeof payload === "object" ? payload : {};
          const username = condition.user || condition.username;
          const user = mockFindUser(username);
          if (user) mockDeleteAccount(username);
        }
        return emptyResponse([]);
      },
      eq: () => query(table, operation, payload),
      or: () => query(table, operation, payload),
    };
    return builder;
  };

  return {
    from: (table) => ({
      select: () => query(table, "select"),
      insert: (rows) => query(table, "insert", Array.isArray(rows) ? rows[0] : rows),
      update: (values) => query(table, "update", values),
      delete: () => query(table, "delete"),
    }),
  };
};

const supabase = hasSupabase(runtimeConfig)
  ? createClient(runtimeConfig.supabaseUrl, runtimeConfig.supabaseKey)
  : createLocalAdapter();

export const isSupabaseConfigured = hasSupabase(runtimeConfig);
export default supabase;
