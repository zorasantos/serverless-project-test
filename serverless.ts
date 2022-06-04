import type { AWS } from '@serverless/typescript';

const serverlessConfiguration: AWS = {
  service: 'userlogin',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild', 'serverless-offline'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
    },
  },
  // import the function via paths
  functions: {
    hello: {
      handler: "src/functions/hello.handler",
      events: [
        {
          http: {
            path: "hello",
            method: "get",

            cors: true
          }
        }
      ]
    }
  },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    }
  },
  resources: {
    Resources: {
      CognitoUserPoolCognitoUserPool: {
        Type: "AWS::Cognito::UserPool",
        Properties: {
          UserPoolName: function() {
            return `${this.service}-${this.provider.stage}`
          },
          Policies: {
            PasswordPolicy: {
              MinimumLength: 8
            }
          },
          UsernameAttributes: "email",
          AutoVerifiedAttributes: "email"
        }
      },
      CognitoUserPoolClient: {
        Type: "AWS::Cognito::UserPoolClient",
        Properties: {
          ClientName: function() {
            return `${this.service}-${this.provider.stage}`
          },
          UserPoolId: {
            Ref: "CognitoUserPoolCognitoUserPool"
          },
          GenerateSecret: false
        }
      }
    }
  }
};

module.exports = serverlessConfiguration;
