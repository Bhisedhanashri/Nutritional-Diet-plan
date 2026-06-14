export * from "./generated/api";
export type * from './generated/types';

import {
  CreateOpenaiConversationBody as CreateOpenaiConversationBodyVal,
  LogMealBody as LogMealBodyVal,
  LogWaterBody as LogWaterBodyVal,
  LogWeightBody as LogWeightBodyVal,
  SendOpenaiMessageBody as SendOpenaiMessageBodyVal
} from "./generated/api";

import type {
  CreateOpenaiConversationBody as CreateOpenaiConversationBodyType,
  LogMealBody as LogMealBodyType,
  LogWaterBody as LogWaterBodyType,
  LogWeightBody as LogWeightBodyType,
  SendOpenaiMessageBody as SendOpenaiMessageBodyType
} from "./generated/types";

export const CreateOpenaiConversationBody = CreateOpenaiConversationBodyVal;
export type CreateOpenaiConversationBody = CreateOpenaiConversationBodyType;

export const LogMealBody = LogMealBodyVal;
export type LogMealBody = LogMealBodyType;

export const LogWaterBody = LogWaterBodyVal;
export type LogWaterBody = LogWaterBodyType;

export const LogWeightBody = LogWeightBodyVal;
export type LogWeightBody = LogWeightBodyType;

export const SendOpenaiMessageBody = SendOpenaiMessageBodyVal;
export type SendOpenaiMessageBody = SendOpenaiMessageBodyType;




