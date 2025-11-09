/**
 * CI/CD Integration - GitLab CI
 * Provides GitLab CI pipeline templates and helpers
 */

export interface GitLabCIConfig {
  stages: string[];
  scanOnMerge: boolean;
  scanOnPush: boolean;
  notifyOnCritical: boolean;
  webhookUrl?: string;
}

export class GitLabCIHelper {
  /**
   * Generate GitLab CI YAML configuration
   */
  static generatePipeline(config: GitLabCIConfig): string {
    return `.gitlab-ci.yml

stages:
  ${config.stages.join("\n  ")}

security_scan:
  stage: test
  image: node:18
  script:
    - npm ci
    - npx @securecheck/cli scan --target . --type file --format json --output scan-results.json
  artifacts:
    when: always
    paths:
      - scan-results.json
    reports:
      security: scan-results.json
  only:
    ${config.scanOnPush ? "- push" : ""}
    ${config.scanOnMerge ? "- merge_requests" : ""}
  ${config.notifyOnCritical ? `after_script:
    - |
      if [ "$CI_JOB_STATUS" == "failed" ]; then
        curl -X POST ${config.webhookUrl || "$CI_WEBHOOK_URL"} \\
          -H "Content-Type: application/json" \\
          -d '{"event": "critical_vulnerability", "project": "$CI_PROJECT_NAME", "commit": "$CI_COMMIT_SHA"}'
      fi` : ""}
`;
  }

  /**
   * Generate .gitlab-ci.yml file content
   */
  static generatePipelineFile(config: GitLabCIConfig): string {
    return this.generatePipeline(config);
  }
}

