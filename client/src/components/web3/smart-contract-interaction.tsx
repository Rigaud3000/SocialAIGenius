import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info, Code, FileCode, Check, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

// Sample ABI (Simplified ERC-20 interface)
const sampleAbi = [
  {
    "constant": true,
    "inputs": [],
    "name": "name",
    "outputs": [{"name": "", "type": "string"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "symbol",
    "outputs": [{"name": "", "type": "string"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [{"name": "", "type": "uint8"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"name": "", "type": "uint256"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "type": "function"
  }
];

// Sample template contracts
const contractTemplates = [
  {
    name: "Social Token",
    description: "Create a custom token for your community or brand",
    abi: sampleAbi,
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BrandToken is ERC20, Ownable {
    uint256 private _initialSupply = 1000000 * 10**18; // 1 million tokens
    
    constructor() ERC20("YourBrandToken", "YBT") {
        _mint(msg.sender, _initialSupply);
    }
    
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}`
  },
  {
    name: "NFT Collection",
    description: "Launch an NFT collection for your brand",
    abi: [
      {
        "inputs": [
          { "internalType": "string", "name": "name", "type": "string" },
          { "internalType": "string", "name": "symbol", "type": "string" }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "inputs": [
          { "internalType": "address", "name": "to", "type": "address" },
          { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
        ],
        "name": "approve",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          { "internalType": "address", "name": "to", "type": "address" },
          { "internalType": "string", "name": "uri", "type": "string" }
        ],
        "name": "safeMint",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ],
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BrandNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    constructor(string memory name, string memory symbol) ERC721(name, symbol) {}

    function safeMint(address to, string memory uri) public onlyOwner {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }
}`
  },
  {
    name: "Community Access",
    description: "Control access to exclusive content with blockchain verification",
    abi: [
      {
        "inputs": [
          { "internalType": "address", "name": "user", "type": "address" }
        ],
        "name": "hasAccess",
        "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          { "internalType": "address", "name": "user", "type": "address" }
        ],
        "name": "grantAccess",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ],
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract CommunityAccess is Ownable {
    mapping(address => bool) private _hasAccess;
    
    event AccessGranted(address indexed user);
    event AccessRevoked(address indexed user);
    
    function hasAccess(address user) public view returns (bool) {
        return _hasAccess[user];
    }
    
    function grantAccess(address user) public onlyOwner {
        _hasAccess[user] = true;
        emit AccessGranted(user);
    }
    
    function revokeAccess(address user) public onlyOwner {
        _hasAccess[user] = false;
        emit AccessRevoked(user);
    }
}`
  }
];

export default function SmartContractInteraction() {
  const [contractAddress, setContractAddress] = useState('');
  const [abi, setAbi] = useState(JSON.stringify(sampleAbi, null, 2));
  const [method, setMethod] = useState('');
  const [params, setParams] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [deployProgress, setDeployProgress] = useState(0);
  const [deployStatus, setDeployStatus] = useState<'idle' | 'deploying' | 'success' | 'error'>('idle');

  // Parse ABI to extract available methods
  const parsedAbi = React.useMemo(() => {
    try {
      return JSON.parse(abi);
    } catch (e) {
      return [];
    }
  }, [abi]);

  // Filter methods for display
  const methods = React.useMemo(() => {
    return parsedAbi.filter((item: any) => 
      item.type === 'function' && 
      (item.stateMutability === 'view' || item.stateMutability === 'pure' || item.constant === true)
    );
  }, [parsedAbi]);

  // Mock function to simulate contract interaction
  const callContract = async () => {
    if (!contractAddress || !method) {
      toast({
        title: "Missing Information",
        description: "Please provide a contract address and select a method.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setResult('');

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      // Mock result based on method
      let mockResult;
      
      if (method === 'name') {
        mockResult = '"BrandToken"';
      } else if (method === 'symbol') {
        mockResult = '"BRD"';
      } else if (method === 'decimals') {
        mockResult = '18';
      } else if (method === 'totalSupply') {
        mockResult = '1000000000000000000000000';
      } else if (method === 'balanceOf') {
        mockResult = '250000000000000000000000';
      } else {
        mockResult = 'Success';
      }

      setResult(mockResult);
      
      toast({
        title: "Contract Call Successful",
        description: `Successfully called ${method} on contract`,
      });
    } catch (error) {
      toast({
        title: "Contract Call Failed",
        description: "There was an error calling the contract method.",
        variant: "destructive",
      });
      setResult('Error: Failed to call contract method');
    } finally {
      setLoading(false);
    }
  };

  // Mock function to simulate contract deployment
  const deployContract = async () => {
    if (!customCode && !selectedTemplate) {
      toast({
        title: "Missing Information",
        description: "Please select a template or enter custom code.",
        variant: "destructive",
      });
      return;
    }

    setDeployStatus('deploying');
    setDeployProgress(0);

    // Simulate deployment progress
    const interval = setInterval(() => {
      setDeployProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + 10;
      });
    }, 500);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    clearInterval(interval);
    setDeployProgress(100);
    
    toast({
      title: "Contract Deployed",
      description: "Your smart contract has been deployed successfully.",
    });
    
    setDeployStatus('success');
    setContractAddress('0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b');
    
    // Reset after a moment
    setTimeout(() => {
      setDeployStatus('idle');
      setDeployProgress(0);
    }, 3000);
  };

  // Handle template selection
  const handleTemplateChange = (template: string) => {
    setSelectedTemplate(template);
    const selected = contractTemplates.find(t => t.name === template);
    if (selected) {
      setCustomCode(selected.code);
      setAbi(JSON.stringify(selected.abi, null, 2));
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="interact" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="interact">Interact with Contracts</TabsTrigger>
          <TabsTrigger value="deploy">Deploy Contracts</TabsTrigger>
        </TabsList>
        
        {/* Interact with Contracts Tab */}
        <TabsContent value="interact">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Code className="mr-2 h-5 w-5 text-primary" />
                Smart Contract Interaction
              </CardTitle>
              <CardDescription>
                Interact with any smart contract on Ethereum and other supported blockchains
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="default" className="bg-blue-50 text-blue-800 border-blue-200">
                <Info className="h-4 w-4 mr-2" />
                <AlertDescription>
                  Connect your wallet to enable full contract interaction capabilities.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <Label>Contract Address</Label>
                <Input 
                  placeholder="0x..." 
                  value={contractAddress}
                  onChange={(e) => setContractAddress(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Contract ABI</Label>
                <Textarea 
                  placeholder="[{...}]" 
                  className="font-mono text-sm"
                  rows={5}
                  value={abi}
                  onChange={(e) => setAbi(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Method</Label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                >
                  <option value="">Select a method</option>
                  {methods.map((m: any, i: number) => (
                    <option key={i} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {method && (
                <div className="space-y-2">
                  <Label>Parameters</Label>
                  <Input 
                    placeholder="comma separated values (e.g. '0x1234..., 1000')" 
                    value={params}
                    onChange={(e) => setParams(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter parameters for the selected method, if required.
                  </p>
                </div>
              )}
              
              {result && (
                <div className="space-y-2">
                  <Label>Result</Label>
                  <div className="bg-gray-50 p-3 rounded-md font-mono text-sm overflow-auto max-h-36">
                    {result}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                onClick={callContract} 
                disabled={loading || !contractAddress || !method}
              >
                {loading ? "Processing..." : "Call Contract"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Deploy Contracts Tab */}
        <TabsContent value="deploy">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileCode className="mr-2 h-5 w-5 text-primary" />
                Smart Contract Deployment
              </CardTitle>
              <CardDescription>
                Deploy custom smart contracts to Ethereum and other supported blockchains
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="default" className="bg-amber-50 text-amber-800 border-amber-200">
                <AlertTriangle className="h-4 w-4 mr-2" />
                <AlertDescription>
                  You need to connect your wallet and have enough ETH/tokens to pay for gas fees.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <Label>Contract Template</Label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={selectedTemplate}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                >
                  <option value="">Select a template or create custom</option>
                  {contractTemplates.map((template, i) => (
                    <option key={i} value={template.name}>
                      {template.name} - {template.description}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label>Contract Code</Label>
                <Textarea 
                  placeholder="// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract YourContract {
  // Your contract code here
}" 
                  className="font-mono text-sm"
                  rows={10}
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                />
              </div>
              
              {deployStatus === 'deploying' && (
                <div className="space-y-2">
                  <Label>Deployment Progress</Label>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-primary h-2.5 rounded-full" 
                      style={{ width: `${deployProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-center text-muted-foreground">
                    {deployProgress < 100 ? 'Deploying contract...' : 'Finalizing deployment...'}
                  </p>
                </div>
              )}
              
              {deployStatus === 'success' && (
                <div className="bg-green-50 p-4 rounded-md border border-green-200">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">
                        Contract deployed successfully
                      </p>
                      <p className="mt-1 text-xs text-green-700">
                        Contract Address: {contractAddress}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                onClick={deployContract} 
                disabled={deployStatus === 'deploying' || (!customCode && !selectedTemplate)}
              >
                {deployStatus === 'deploying' ? "Deploying..." : "Deploy Contract"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}