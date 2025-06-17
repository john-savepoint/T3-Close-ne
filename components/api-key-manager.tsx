"use client";

import { useState } from 'react';
import { useApiKeys } from '@/hooks/use-api-keys';
import { ApiKeyValidator } from '@/lib/key-validation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Key, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  ExternalLink,
  Trash2,
  TestTube,
  AlertTriangle
} from 'lucide-react';

interface ProviderConfig {
  name: string;
  description: string;
  icon: string;
  placeholder: string;
  helpUrl: string;
}

const PROVIDERS: Record<string, ProviderConfig> = {
  openrouter: {
    name: 'OpenRouter',
    description: 'Access to 50+ AI models including GPT-4, Claude, and Gemini',
    icon: '🔀',
    placeholder: 'sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    helpUrl: 'https://openrouter.ai/keys'
  },
  openai: {
    name: 'OpenAI',
    description: 'Direct access to GPT-4o, GPT-4o Mini, and other OpenAI models',
    icon: '🤖',
    placeholder: 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    helpUrl: 'https://platform.openai.com/api-keys'
  },
  anthropic: {
    name: 'Anthropic',
    description: 'Direct access to Claude 3.5 Sonnet, Opus, and Haiku models',
    icon: '🧠',
    placeholder: 'sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    helpUrl: 'https://console.anthropic.com/keys'
  }
};

export function ApiKeyManager() {
  const { 
    config, 
    validation, 
    isLoading, 
    updateKey, 
    removeKey, 
    validateKey, 
    validateAllKeys,
    clearAllKeys,
    getValidationStatus,
    hasKeys
  } = useApiKeys();

  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const [editingKey, setEditingKey] = useState<Record<string, string>>({});
  const [testingKey, setTestingKey] = useState<string | null>(null);

  const toggleKeyVisibility = (provider: string) => {
    setVisibleKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  const handleKeyEdit = (provider: string, value: string) => {
    setEditingKey(prev => ({ ...prev, [provider]: value }));
  };

  const handleKeySave = async (provider: string) => {
    const value = editingKey[provider];
    if (value !== undefined) {
      await updateKey(provider as keyof typeof config, value);
      setEditingKey(prev => {
        const newState = { ...prev };
        delete newState[provider];
        return newState;
      });
    }
  };

  const handleKeyRemove = (provider: string) => {
    removeKey(provider as keyof typeof config);
    setEditingKey(prev => {
      const newState = { ...prev };
      delete newState[provider];
      return newState;
    });
  };

  const handleKeyTest = async (provider: string) => {
    setTestingKey(provider);
    await validateKey(provider as keyof typeof config);
    setTestingKey(null);
  };

  const renderValidationStatus = (provider: string) => {
    const status = getValidationStatus(provider as keyof typeof config);
    const result = validation[provider];

    if (testingKey === provider) {
      return (
        <Badge variant="outline" className="border-blue-500/50 bg-blue-500/20 text-blue-400">
          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
          Testing...
        </Badge>
      );
    }

    switch (status) {
      case 'valid':
        return (
          <Badge className="border-green-500/50 bg-green-500/20 text-green-400">
            <CheckCircle className="mr-1 h-3 w-3" />
            Valid
          </Badge>
        );
      case 'invalid':
        return (
          <Badge variant="destructive" className="border-red-500/50 bg-red-500/20 text-red-400">
            <XCircle className="mr-1 h-3 w-3" />
            Invalid
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-mauve-subtle/70">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Not tested
          </Badge>
        );
    }
  };

  const renderKeyInput = (provider: string, providerConfig: ProviderConfig) => {
    const currentKey = config[provider as keyof typeof config];
    const isEditing = editingKey[provider] !== undefined;
    const displayValue = isEditing ? editingKey[provider] : (currentKey || '');
    const isVisible = visibleKeys[provider];
    const status = getValidationStatus(provider as keyof typeof config);
    const result = validation[provider];

    return (
      <Card key={provider} className="border-mauve-dark bg-mauve-surface/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">{providerConfig.icon}</span>
              <div>
                <h3 className="text-lg font-medium text-foreground">{providerConfig.name}</h3>
                <p className="text-sm text-mauve-subtle/70">{providerConfig.description}</p>
              </div>
            </div>
            {renderValidationStatus(provider)}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`${provider}-key`} className="text-sm font-medium">
              API Key
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id={`${provider}-key`}
                  type={isVisible ? "text" : "password"}
                  placeholder={providerConfig.placeholder}
                  value={displayValue}
                  onChange={(e) => handleKeyEdit(provider, e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 p-0"
                  onClick={() => toggleKeyVisibility(provider)}
                >
                  {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              
              {isEditing || !currentKey ? (
                <Button 
                  onClick={() => handleKeySave(provider)}
                  disabled={!editingKey[provider] || editingKey[provider].trim() === ''}
                  size="sm"
                >
                  Save
                </Button>
              ) : (
                <div className="flex gap-1">
                  <Button 
                    onClick={() => handleKeyTest(provider)}
                    disabled={testingKey === provider}
                    variant="outline"
                    size="sm"
                  >
                    <TestTube className="h-4 w-4" />
                  </Button>
                  <Button 
                    onClick={() => handleKeyRemove(provider)}
                    variant="outline"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {result && !result.isValid && result.error && (
            <Alert className="border-red-500/50 bg-red-500/10">
              <XCircle className="h-4 w-4" />
              <AlertDescription className="text-red-400">
                {result.error}
              </AlertDescription>
            </Alert>
          )}

          {result && result.isValid && result.modelInfo && (
            <Alert className="border-green-500/50 bg-green-500/10">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="text-green-400">
                <div className="space-y-1">
                  <div>Connected to {result.modelInfo.provider}</div>
                  <div className="text-xs">
                    Available models: {result.modelInfo.models.join(', ')}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between text-xs text-mauve-subtle/70">
            <span>Get your API key from:</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-auto p-0 text-xs text-mauve-accent hover:text-mauve-accent/80"
              onClick={() => window.open(providerConfig.helpUrl, '_blank')}
            >
              {providerConfig.name} Dashboard
              <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Key className="h-6 w-6" />
            API Key Management
          </h2>
          <p className="text-mauve-subtle/70">
            Bring your own API keys for direct access to AI models
          </p>
        </div>
        
        {hasKeys && (
          <div className="flex gap-2">
            <Button 
              onClick={validateAllKeys}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <TestTube className="mr-2 h-4 w-4" />
              )}
              Test All Keys
            </Button>
            <Button 
              onClick={clearAllKeys}
              variant="outline"
              size="sm"
              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All
            </Button>
          </div>
        )}
      </div>

      <Alert className="border-blue-500/50 bg-blue-500/10">
        <Key className="h-4 w-4" />
        <AlertDescription className="text-blue-400">
          <div className="space-y-2">
            <div className="font-medium">Secure Key Storage</div>
            <div className="text-sm">
              Your API keys are stored securely in your browser's local storage and never sent to our servers. 
              We recommend using OpenRouter for the best experience with access to multiple AI models.
            </div>
          </div>
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        {Object.entries(PROVIDERS).map(([provider, config]) => 
          renderKeyInput(provider, config)
        )}
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-foreground">Setup Instructions</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {Object.entries(PROVIDERS).map(([provider, config]) => (
            <Card key={provider} className="border-mauve-dark bg-mauve-surface/20">
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{config.icon}</span>
                    <span className="font-medium">{config.name}</span>
                  </div>
                  <p className="text-xs text-mauve-subtle/70">
                    {config.description}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-xs"
                    onClick={() => window.open(config.helpUrl, '_blank')}
                  >
                    Get API Key
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}