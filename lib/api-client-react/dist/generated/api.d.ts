import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { AuthResponse, CheckFoodBody, CreateOpenaiConversationBody, DailyLog, DietPlan, DietPlanSummary, ErrorResponse, FoodNutrition, GeneratePlanBody, HealthStatus, ListMealLogsParams, LogMealBody, LogWaterBody, LogWeightBody, LoginBody, MealEntry, OpenaiConversation, OpenaiConversationWithMessages, OpenaiError, OpenaiMessage, RegisterBody, SendOpenaiMessageBody, SuccessResponse, User, UserProfile, UserProfileBody, WaterEntry, WeightEntry } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType, BodyType } from '../custom-fetch';
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
/**
 * Returns server health status
 * @summary Health check
 */
export declare const getHealthCheckUrl: () => string;
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Register a new user
 */
export declare const getRegisterUserUrl: () => string;
export declare const registerUser: (registerBody: RegisterBody, options?: RequestInit) => Promise<AuthResponse>;
export declare const getRegisterUserMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof registerUser>>, TError, {
        data: BodyType<RegisterBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof registerUser>>, TError, {
    data: BodyType<RegisterBody>;
}, TContext>;
export type RegisterUserMutationResult = NonNullable<Awaited<ReturnType<typeof registerUser>>>;
export type RegisterUserMutationBody = BodyType<RegisterBody>;
export type RegisterUserMutationError = ErrorType<ErrorResponse>;
/**
* @summary Register a new user
*/
export declare const useRegisterUser: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof registerUser>>, TError, {
        data: BodyType<RegisterBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof registerUser>>, TError, {
    data: BodyType<RegisterBody>;
}, TContext>;
/**
 * @summary Login with email and password
 */
export declare const getLoginUserUrl: () => string;
export declare const loginUser: (loginBody: LoginBody, options?: RequestInit) => Promise<AuthResponse>;
export declare const getLoginUserMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof loginUser>>, TError, {
        data: BodyType<LoginBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof loginUser>>, TError, {
    data: BodyType<LoginBody>;
}, TContext>;
export type LoginUserMutationResult = NonNullable<Awaited<ReturnType<typeof loginUser>>>;
export type LoginUserMutationBody = BodyType<LoginBody>;
export type LoginUserMutationError = ErrorType<ErrorResponse>;
/**
* @summary Login with email and password
*/
export declare const useLoginUser: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof loginUser>>, TError, {
        data: BodyType<LoginBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof loginUser>>, TError, {
    data: BodyType<LoginBody>;
}, TContext>;
/**
 * @summary Logout current user
 */
export declare const getLogoutUserUrl: () => string;
export declare const logoutUser: (options?: RequestInit) => Promise<SuccessResponse>;
export declare const getLogoutUserMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof logoutUser>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof logoutUser>>, TError, void, TContext>;
export type LogoutUserMutationResult = NonNullable<Awaited<ReturnType<typeof logoutUser>>>;
export type LogoutUserMutationError = ErrorType<unknown>;
/**
* @summary Logout current user
*/
export declare const useLogoutUser: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof logoutUser>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof logoutUser>>, TError, void, TContext>;
/**
 * @summary Get current logged in user
 */
export declare const getGetMeUrl: () => string;
export declare const getMe: (options?: RequestInit) => Promise<User>;
export declare const getGetMeQueryKey: () => readonly ["/api/auth/me"];
export declare const getGetMeQueryOptions: <TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMeQueryResult = NonNullable<Awaited<ReturnType<typeof getMe>>>;
export type GetMeQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get current logged in user
 */
export declare function useGetMe<TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get user profile
 */
export declare const getGetProfileUrl: () => string;
export declare const getProfile: (options?: RequestInit) => Promise<UserProfile>;
export declare const getGetProfileQueryKey: () => readonly ["/api/profile"];
export declare const getGetProfileQueryOptions: <TData = Awaited<ReturnType<typeof getProfile>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getProfile>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getProfile>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetProfileQueryResult = NonNullable<Awaited<ReturnType<typeof getProfile>>>;
export type GetProfileQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get user profile
 */
export declare function useGetProfile<TData = Awaited<ReturnType<typeof getProfile>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getProfile>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Create or update user profile
 */
export declare const getCreateOrUpdateProfileUrl: () => string;
export declare const createOrUpdateProfile: (userProfileBody: UserProfileBody, options?: RequestInit) => Promise<UserProfile>;
export declare const getCreateOrUpdateProfileMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createOrUpdateProfile>>, TError, {
        data: BodyType<UserProfileBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createOrUpdateProfile>>, TError, {
    data: BodyType<UserProfileBody>;
}, TContext>;
export type CreateOrUpdateProfileMutationResult = NonNullable<Awaited<ReturnType<typeof createOrUpdateProfile>>>;
export type CreateOrUpdateProfileMutationBody = BodyType<UserProfileBody>;
export type CreateOrUpdateProfileMutationError = ErrorType<unknown>;
/**
* @summary Create or update user profile
*/
export declare const useCreateOrUpdateProfile: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createOrUpdateProfile>>, TError, {
        data: BodyType<UserProfileBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createOrUpdateProfile>>, TError, {
    data: BodyType<UserProfileBody>;
}, TContext>;
/**
 * @summary Generate a 7-day AI diet plan
 */
export declare const getGenerateDietPlanUrl: () => string;
export declare const generateDietPlan: (generatePlanBody: GeneratePlanBody, options?: RequestInit) => Promise<DietPlan>;
export declare const getGenerateDietPlanMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof generateDietPlan>>, TError, {
        data: BodyType<GeneratePlanBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof generateDietPlan>>, TError, {
    data: BodyType<GeneratePlanBody>;
}, TContext>;
export type GenerateDietPlanMutationResult = NonNullable<Awaited<ReturnType<typeof generateDietPlan>>>;
export type GenerateDietPlanMutationBody = BodyType<GeneratePlanBody>;
export type GenerateDietPlanMutationError = ErrorType<unknown>;
/**
* @summary Generate a 7-day AI diet plan
*/
export declare const useGenerateDietPlan: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof generateDietPlan>>, TError, {
        data: BodyType<GeneratePlanBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof generateDietPlan>>, TError, {
    data: BodyType<GeneratePlanBody>;
}, TContext>;
/**
 * @summary List all saved diet plans for the user
 */
export declare const getListDietPlansUrl: () => string;
export declare const listDietPlans: (options?: RequestInit) => Promise<DietPlanSummary[]>;
export declare const getListDietPlansQueryKey: () => readonly ["/api/diet/plans"];
export declare const getListDietPlansQueryOptions: <TData = Awaited<ReturnType<typeof listDietPlans>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listDietPlans>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listDietPlans>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListDietPlansQueryResult = NonNullable<Awaited<ReturnType<typeof listDietPlans>>>;
export type ListDietPlansQueryError = ErrorType<unknown>;
/**
 * @summary List all saved diet plans for the user
 */
export declare function useListDietPlans<TData = Awaited<ReturnType<typeof listDietPlans>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listDietPlans>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get a specific diet plan
 */
export declare const getGetDietPlanUrl: (id: number) => string;
export declare const getDietPlan: (id: number, options?: RequestInit) => Promise<DietPlan>;
export declare const getGetDietPlanQueryKey: (id: number) => readonly [`/api/diet/plans/${number}`];
export declare const getGetDietPlanQueryOptions: <TData = Awaited<ReturnType<typeof getDietPlan>>, TError = ErrorType<ErrorResponse>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDietPlan>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getDietPlan>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetDietPlanQueryResult = NonNullable<Awaited<ReturnType<typeof getDietPlan>>>;
export type GetDietPlanQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get a specific diet plan
 */
export declare function useGetDietPlan<TData = Awaited<ReturnType<typeof getDietPlan>>, TError = ErrorType<ErrorResponse>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDietPlan>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Check calories and nutrition for a food item
 */
export declare const getCheckFoodCaloriesUrl: () => string;
export declare const checkFoodCalories: (checkFoodBody: CheckFoodBody, options?: RequestInit) => Promise<FoodNutrition>;
export declare const getCheckFoodCaloriesMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof checkFoodCalories>>, TError, {
        data: BodyType<CheckFoodBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof checkFoodCalories>>, TError, {
    data: BodyType<CheckFoodBody>;
}, TContext>;
export type CheckFoodCaloriesMutationResult = NonNullable<Awaited<ReturnType<typeof checkFoodCalories>>>;
export type CheckFoodCaloriesMutationBody = BodyType<CheckFoodBody>;
export type CheckFoodCaloriesMutationError = ErrorType<unknown>;
/**
* @summary Check calories and nutrition for a food item
*/
export declare const useCheckFoodCalories: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof checkFoodCalories>>, TError, {
        data: BodyType<CheckFoodBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof checkFoodCalories>>, TError, {
    data: BodyType<CheckFoodBody>;
}, TContext>;
/**
 * @summary Get today's tracking log for the current user
 */
export declare const getGetTodayLogUrl: () => string;
export declare const getTodayLog: (options?: RequestInit) => Promise<DailyLog>;
export declare const getGetTodayLogQueryKey: () => readonly ["/api/tracker/today"];
export declare const getGetTodayLogQueryOptions: <TData = Awaited<ReturnType<typeof getTodayLog>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTodayLog>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getTodayLog>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetTodayLogQueryResult = NonNullable<Awaited<ReturnType<typeof getTodayLog>>>;
export type GetTodayLogQueryError = ErrorType<unknown>;
/**
 * @summary Get today's tracking log for the current user
 */
export declare function useGetTodayLog<TData = Awaited<ReturnType<typeof getTodayLog>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTodayLog>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Log a meal entry
 */
export declare const getLogMealUrl: () => string;
export declare const logMeal: (logMealBody: LogMealBody, options?: RequestInit) => Promise<MealEntry>;
export declare const getLogMealMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof logMeal>>, TError, {
        data: BodyType<LogMealBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof logMeal>>, TError, {
    data: BodyType<LogMealBody>;
}, TContext>;
export type LogMealMutationResult = NonNullable<Awaited<ReturnType<typeof logMeal>>>;
export type LogMealMutationBody = BodyType<LogMealBody>;
export type LogMealMutationError = ErrorType<unknown>;
/**
* @summary Log a meal entry
*/
export declare const useLogMeal: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof logMeal>>, TError, {
        data: BodyType<LogMealBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof logMeal>>, TError, {
    data: BodyType<LogMealBody>;
}, TContext>;
/**
 * @summary Log water intake
 */
export declare const getLogWaterUrl: () => string;
export declare const logWater: (logWaterBody: LogWaterBody, options?: RequestInit) => Promise<WaterEntry>;
export declare const getLogWaterMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof logWater>>, TError, {
        data: BodyType<LogWaterBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof logWater>>, TError, {
    data: BodyType<LogWaterBody>;
}, TContext>;
export type LogWaterMutationResult = NonNullable<Awaited<ReturnType<typeof logWater>>>;
export type LogWaterMutationBody = BodyType<LogWaterBody>;
export type LogWaterMutationError = ErrorType<unknown>;
/**
* @summary Log water intake
*/
export declare const useLogWater: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof logWater>>, TError, {
        data: BodyType<LogWaterBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof logWater>>, TError, {
    data: BodyType<LogWaterBody>;
}, TContext>;
/**
 * @summary List meal logs for a date range
 */
export declare const getListMealLogsUrl: (params?: ListMealLogsParams) => string;
export declare const listMealLogs: (params?: ListMealLogsParams, options?: RequestInit) => Promise<MealEntry[]>;
export declare const getListMealLogsQueryKey: (params?: ListMealLogsParams) => readonly ["/api/tracker/meals", ...ListMealLogsParams[]];
export declare const getListMealLogsQueryOptions: <TData = Awaited<ReturnType<typeof listMealLogs>>, TError = ErrorType<unknown>>(params?: ListMealLogsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listMealLogs>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listMealLogs>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListMealLogsQueryResult = NonNullable<Awaited<ReturnType<typeof listMealLogs>>>;
export type ListMealLogsQueryError = ErrorType<unknown>;
/**
 * @summary List meal logs for a date range
 */
export declare function useListMealLogs<TData = Awaited<ReturnType<typeof listMealLogs>>, TError = ErrorType<unknown>>(params?: ListMealLogsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listMealLogs>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Log a weight entry
 */
export declare const getLogWeightUrl: () => string;
export declare const logWeight: (logWeightBody: LogWeightBody, options?: RequestInit) => Promise<WeightEntry>;
export declare const getLogWeightMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof logWeight>>, TError, {
        data: BodyType<LogWeightBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof logWeight>>, TError, {
    data: BodyType<LogWeightBody>;
}, TContext>;
export type LogWeightMutationResult = NonNullable<Awaited<ReturnType<typeof logWeight>>>;
export type LogWeightMutationBody = BodyType<LogWeightBody>;
export type LogWeightMutationError = ErrorType<unknown>;
/**
* @summary Log a weight entry
*/
export declare const useLogWeight: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof logWeight>>, TError, {
        data: BodyType<LogWeightBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof logWeight>>, TError, {
    data: BodyType<LogWeightBody>;
}, TContext>;
/**
 * @summary List weight logs
 */
export declare const getListWeightLogsUrl: () => string;
export declare const listWeightLogs: (options?: RequestInit) => Promise<WeightEntry[]>;
export declare const getListWeightLogsQueryKey: () => readonly ["/api/tracker/weight"];
export declare const getListWeightLogsQueryOptions: <TData = Awaited<ReturnType<typeof listWeightLogs>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listWeightLogs>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listWeightLogs>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListWeightLogsQueryResult = NonNullable<Awaited<ReturnType<typeof listWeightLogs>>>;
export type ListWeightLogsQueryError = ErrorType<unknown>;
/**
 * @summary List weight logs
 */
export declare function useListWeightLogs<TData = Awaited<ReturnType<typeof listWeightLogs>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listWeightLogs>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary List all conversations
 */
export declare const getListOpenaiConversationsUrl: () => string;
export declare const listOpenaiConversations: (options?: RequestInit) => Promise<OpenaiConversation[]>;
export declare const getListOpenaiConversationsQueryKey: () => readonly ["/api/openai/conversations"];
export declare const getListOpenaiConversationsQueryOptions: <TData = Awaited<ReturnType<typeof listOpenaiConversations>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listOpenaiConversations>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listOpenaiConversations>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListOpenaiConversationsQueryResult = NonNullable<Awaited<ReturnType<typeof listOpenaiConversations>>>;
export type ListOpenaiConversationsQueryError = ErrorType<unknown>;
/**
 * @summary List all conversations
 */
export declare function useListOpenaiConversations<TData = Awaited<ReturnType<typeof listOpenaiConversations>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listOpenaiConversations>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Create a new conversation
 */
export declare const getCreateOpenaiConversationUrl: () => string;
export declare const createOpenaiConversation: (createOpenaiConversationBody: CreateOpenaiConversationBody, options?: RequestInit) => Promise<OpenaiConversation>;
export declare const getCreateOpenaiConversationMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createOpenaiConversation>>, TError, {
        data: BodyType<CreateOpenaiConversationBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createOpenaiConversation>>, TError, {
    data: BodyType<CreateOpenaiConversationBody>;
}, TContext>;
export type CreateOpenaiConversationMutationResult = NonNullable<Awaited<ReturnType<typeof createOpenaiConversation>>>;
export type CreateOpenaiConversationMutationBody = BodyType<CreateOpenaiConversationBody>;
export type CreateOpenaiConversationMutationError = ErrorType<unknown>;
/**
* @summary Create a new conversation
*/
export declare const useCreateOpenaiConversation: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createOpenaiConversation>>, TError, {
        data: BodyType<CreateOpenaiConversationBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createOpenaiConversation>>, TError, {
    data: BodyType<CreateOpenaiConversationBody>;
}, TContext>;
/**
 * @summary Get conversation with messages
 */
export declare const getGetOpenaiConversationUrl: (id: number) => string;
export declare const getOpenaiConversation: (id: number, options?: RequestInit) => Promise<OpenaiConversationWithMessages>;
export declare const getGetOpenaiConversationQueryKey: (id: number) => readonly [`/api/openai/conversations/${number}`];
export declare const getGetOpenaiConversationQueryOptions: <TData = Awaited<ReturnType<typeof getOpenaiConversation>>, TError = ErrorType<OpenaiError>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getOpenaiConversation>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getOpenaiConversation>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetOpenaiConversationQueryResult = NonNullable<Awaited<ReturnType<typeof getOpenaiConversation>>>;
export type GetOpenaiConversationQueryError = ErrorType<OpenaiError>;
/**
 * @summary Get conversation with messages
 */
export declare function useGetOpenaiConversation<TData = Awaited<ReturnType<typeof getOpenaiConversation>>, TError = ErrorType<OpenaiError>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getOpenaiConversation>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Delete a conversation
 */
export declare const getDeleteOpenaiConversationUrl: (id: number) => string;
export declare const deleteOpenaiConversation: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteOpenaiConversationMutationOptions: <TError = ErrorType<OpenaiError>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteOpenaiConversation>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteOpenaiConversation>>, TError, {
    id: number;
}, TContext>;
export type DeleteOpenaiConversationMutationResult = NonNullable<Awaited<ReturnType<typeof deleteOpenaiConversation>>>;
export type DeleteOpenaiConversationMutationError = ErrorType<OpenaiError>;
/**
* @summary Delete a conversation
*/
export declare const useDeleteOpenaiConversation: <TError = ErrorType<OpenaiError>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteOpenaiConversation>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteOpenaiConversation>>, TError, {
    id: number;
}, TContext>;
/**
 * @summary List messages in a conversation
 */
export declare const getListOpenaiMessagesUrl: (id: number) => string;
export declare const listOpenaiMessages: (id: number, options?: RequestInit) => Promise<OpenaiMessage[]>;
export declare const getListOpenaiMessagesQueryKey: (id: number) => readonly [`/api/openai/conversations/${number}/messages`];
export declare const getListOpenaiMessagesQueryOptions: <TData = Awaited<ReturnType<typeof listOpenaiMessages>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listOpenaiMessages>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listOpenaiMessages>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListOpenaiMessagesQueryResult = NonNullable<Awaited<ReturnType<typeof listOpenaiMessages>>>;
export type ListOpenaiMessagesQueryError = ErrorType<unknown>;
/**
 * @summary List messages in a conversation
 */
export declare function useListOpenaiMessages<TData = Awaited<ReturnType<typeof listOpenaiMessages>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listOpenaiMessages>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Send a text message and receive a streaming text response
 */
export declare const getSendOpenaiMessageUrl: (id: number) => string;
export declare const sendOpenaiMessage: (id: number, sendOpenaiMessageBody: SendOpenaiMessageBody, options?: RequestInit) => Promise<unknown>;
export declare const getSendOpenaiMessageMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof sendOpenaiMessage>>, TError, {
        id: number;
        data: BodyType<SendOpenaiMessageBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof sendOpenaiMessage>>, TError, {
    id: number;
    data: BodyType<SendOpenaiMessageBody>;
}, TContext>;
export type SendOpenaiMessageMutationResult = NonNullable<Awaited<ReturnType<typeof sendOpenaiMessage>>>;
export type SendOpenaiMessageMutationBody = BodyType<SendOpenaiMessageBody>;
export type SendOpenaiMessageMutationError = ErrorType<unknown>;
/**
* @summary Send a text message and receive a streaming text response
*/
export declare const useSendOpenaiMessage: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof sendOpenaiMessage>>, TError, {
        id: number;
        data: BodyType<SendOpenaiMessageBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof sendOpenaiMessage>>, TError, {
    id: number;
    data: BodyType<SendOpenaiMessageBody>;
}, TContext>;
export {};
//# sourceMappingURL=api.d.ts.map