export * from "./generated/api";
export type * from './generated/types';
import type { CreateOpenaiConversationBody as CreateOpenaiConversationBodyType, LogMealBody as LogMealBodyType, LogWaterBody as LogWaterBodyType, LogWeightBody as LogWeightBodyType, SendOpenaiMessageBody as SendOpenaiMessageBodyType } from "./generated/types";
export declare const CreateOpenaiConversationBody: import("zod").ZodObject<{
    title: import("zod").ZodString;
}, "strip", import("zod").ZodTypeAny, {
    title: string;
}, {
    title: string;
}>;
export type CreateOpenaiConversationBody = CreateOpenaiConversationBodyType;
export declare const LogMealBody: import("zod").ZodObject<{
    mealType: import("zod").ZodEnum<["breakfast", "lunch", "dinner", "snack"]>;
    foodName: import("zod").ZodString;
    portionSize: import("zod").ZodString;
    calories: import("zod").ZodNumber;
    proteinGrams: import("zod").ZodOptional<import("zod").ZodNumber>;
    carbsGrams: import("zod").ZodOptional<import("zod").ZodNumber>;
    fatGrams: import("zod").ZodOptional<import("zod").ZodNumber>;
    loggedAt: import("zod").ZodOptional<import("zod").ZodDate>;
}, "strip", import("zod").ZodTypeAny, {
    mealType: "breakfast" | "lunch" | "dinner" | "snack";
    foodName: string;
    portionSize: string;
    calories: number;
    proteinGrams?: number | undefined;
    carbsGrams?: number | undefined;
    fatGrams?: number | undefined;
    loggedAt?: Date | undefined;
}, {
    mealType: "breakfast" | "lunch" | "dinner" | "snack";
    foodName: string;
    portionSize: string;
    calories: number;
    proteinGrams?: number | undefined;
    carbsGrams?: number | undefined;
    fatGrams?: number | undefined;
    loggedAt?: Date | undefined;
}>;
export type LogMealBody = LogMealBodyType;
export declare const LogWaterBody: import("zod").ZodObject<{
    amountMl: import("zod").ZodNumber;
    loggedAt: import("zod").ZodOptional<import("zod").ZodDate>;
}, "strip", import("zod").ZodTypeAny, {
    amountMl: number;
    loggedAt?: Date | undefined;
}, {
    amountMl: number;
    loggedAt?: Date | undefined;
}>;
export type LogWaterBody = LogWaterBodyType;
export declare const LogWeightBody: import("zod").ZodObject<{
    weightKg: import("zod").ZodNumber;
    loggedAt: import("zod").ZodOptional<import("zod").ZodDate>;
}, "strip", import("zod").ZodTypeAny, {
    weightKg: number;
    loggedAt?: Date | undefined;
}, {
    weightKg: number;
    loggedAt?: Date | undefined;
}>;
export type LogWeightBody = LogWeightBodyType;
export declare const SendOpenaiMessageBody: import("zod").ZodObject<{
    content: import("zod").ZodString;
}, "strip", import("zod").ZodTypeAny, {
    content: string;
}, {
    content: string;
}>;
export type SendOpenaiMessageBody = SendOpenaiMessageBodyType;
//# sourceMappingURL=index.d.ts.map