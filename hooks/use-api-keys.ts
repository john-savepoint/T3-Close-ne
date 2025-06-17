"use client";

import { useState, useEffect, useCallback } from 'react';
import { ApiKeyConfig, ApiKeyValidator, ApiKeyValidationResult } from '@/lib/key-validation';

interface ApiKeyStorage {
  config: ApiKeyConfig;
  validation: Record<string, ApiKeyValidationResult>;
  lastValidated?: number;
}

const STORAGE_KEY = 'z6chat_api_keys';
const VALIDATION_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function useApiKeys() {
  const [config, setConfig] = useState<ApiKeyConfig>({});
  const [validation, setValidation] = useState<Record<string, ApiKeyValidationResult>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load keys from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data: ApiKeyStorage = JSON.parse(stored);
        setConfig(data.config || {});
        
        // Check if validation cache is still valid
        const now = Date.now();
        const isValidationFresh = data.lastValidated && 
          (now - data.lastValidated) < VALIDATION_CACHE_TTL;
        
        if (isValidationFresh && data.validation) {
          setValidation(data.validation);
        }
      }
    } catch (error) {
      console.error('Failed to load API keys from storage:', error);
    }
    setIsInitialized(true);
  }, []);

  // Save keys to localStorage
  const saveToStorage = useCallback((newConfig: ApiKeyConfig, newValidation?: Record<string, ApiKeyValidationResult>) => {
    try {
      const data: ApiKeyStorage = {
        config: newConfig,
        validation: newValidation || validation,
        lastValidated: newValidation ? Date.now() : undefined
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save API keys to storage:', error);
    }
  }, [validation]);

  // Update a specific API key
  const updateKey = useCallback(async (provider: keyof ApiKeyConfig, apiKey: string) => {
    const newConfig = { ...config, [provider]: apiKey };
    setConfig(newConfig);
    
    // Clear validation for this provider
    const newValidation = { ...validation };
    delete newValidation[provider];
    setValidation(newValidation);
    
    saveToStorage(newConfig, newValidation);
  }, [config, validation, saveToStorage]);

  // Remove a specific API key
  const removeKey = useCallback((provider: keyof ApiKeyConfig) => {
    const newConfig = { ...config };
    delete newConfig[provider];
    setConfig(newConfig);
    
    // Clear validation for this provider
    const newValidation = { ...validation };
    delete newValidation[provider];
    setValidation(newValidation);
    
    saveToStorage(newConfig, newValidation);
  }, [config, validation, saveToStorage]);

  // Validate a specific key
  const validateKey = useCallback(async (provider: keyof ApiKeyConfig): Promise<ApiKeyValidationResult> => {
    const apiKey = config[provider];
    if (!apiKey) {
      return { isValid: false, error: 'No API key provided' };
    }

    setIsLoading(true);
    try {
      let result: ApiKeyValidationResult;
      
      switch (provider) {
        case 'openrouter':
          result = await ApiKeyValidator.validateOpenRouterKey(apiKey);
          break;
        case 'openai':
          result = await ApiKeyValidator.validateOpenAIKey(apiKey);
          break;
        case 'anthropic':
          result = await ApiKeyValidator.validateAnthropicKey(apiKey);
          break;
        default:
          result = { isValid: false, error: 'Unsupported provider' };
      }

      // Update validation state
      const newValidation = { ...validation, [provider]: result };
      setValidation(newValidation);
      saveToStorage(config, newValidation);
      
      return result;
    } catch (error) {
      const errorResult = { 
        isValid: false, 
        error: error instanceof Error ? error.message : 'Validation failed' 
      };
      
      const newValidation = { ...validation, [provider]: errorResult };
      setValidation(newValidation);
      saveToStorage(config, newValidation);
      
      return errorResult;
    } finally {
      setIsLoading(false);
    }
  }, [config, validation, saveToStorage]);

  // Validate all keys
  const validateAllKeys = useCallback(async () => {
    if (Object.keys(config).length === 0) {
      return {};
    }

    setIsLoading(true);
    try {
      const results = await ApiKeyValidator.validateAllKeys(config);
      setValidation(results);
      saveToStorage(config, results);
      return results;
    } catch (error) {
      console.error('Failed to validate API keys:', error);
      return {};
    } finally {
      setIsLoading(false);
    }
  }, [config, saveToStorage]);

  // Clear all keys
  const clearAllKeys = useCallback(() => {
    setConfig({});
    setValidation({});
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear API keys from storage:', error);
    }
  }, []);

  // Get validation status for a provider
  const getValidationStatus = useCallback((provider: keyof ApiKeyConfig) => {
    const result = validation[provider];
    if (!result) return 'unknown';
    return result.isValid ? 'valid' : 'invalid';
  }, [validation]);

  // Check if any keys are configured
  const hasKeys = Object.keys(config).some(key => config[key as keyof ApiKeyConfig]);

  // Get configured providers
  const configuredProviders = Object.keys(config).filter(key => config[key as keyof ApiKeyConfig]) as (keyof ApiKeyConfig)[];

  // Get priority provider (OpenRouter first, then others)
  const getPriorityProvider = useCallback((): keyof ApiKeyConfig | null => {
    if (config.openrouter && validation.openrouter?.isValid) return 'openrouter';
    if (config.openai && validation.openai?.isValid) return 'openai';
    if (config.anthropic && validation.anthropic?.isValid) return 'anthropic';
    return null;
  }, [config, validation]);

  return {
    // State
    config,
    validation,
    isLoading,
    isInitialized,
    hasKeys,
    configuredProviders,
    
    // Actions
    updateKey,
    removeKey,
    validateKey,
    validateAllKeys,
    clearAllKeys,
    
    // Utilities
    getValidationStatus,
    getPriorityProvider
  };
}