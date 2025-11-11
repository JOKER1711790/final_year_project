/**
 * CI/CD Integration - GitHub Actions
 * Provides GitHub Actions workflow templates and helpers
 */

export interface GitHubActionsConfig {
  onPush: boolean;
  onPullRequest: boolean;
  onSchedule?: string;
  scanOnFailure: boolean;
  notifyOnCritical: boolean;
  webhookUrl?: string;
}

export class GitHubActionsHelper {
  /**
   * Generate GitHub Actions workflow YAML
   */
  static generateWorkflow(config: GitHubActionsConfig): string {
    const triggers: string[] = [];
    if (config.onPush) triggers.push("push:");
    if (config.onPullRequest) triggers.push("pull_request:");
    if (config.onSchedule) triggers.push(`schedule:\n      - cron: '${config.onSchedule}'`);

    return `name: Security Scan

on:
  ${triggers.join("\n  ")}

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run security scan
        id: scan
        run: |
          npx @securecheck/cli scan --target . --type file --format json --output scan-results.json
        continue-on-error: true

      - name: Upload scan results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: scan-results
          path: scan-results.json

      ${config.notifyOnCritical ? `- name: Notify on critical vulnerabilities
        if: steps.scan.outcome == 'failure'
        run: |
          curl -X POST ${config.webhookUrl || '${{ secrets.WEBHOOK_URL }}'} \\
            -H 'Content-Type: application/json' \\
            -d '{"event": "critical_vulnerability", "repository": "\${{ github.repository }}", "commit": "\${{ github.sha }}"}'` : ''}

      ${config.scanOnFailure ? `- name: Deep scan on failure
        if: failure()
        run: |
          npx @securecheck/cli scan --target . --type file --deep --format json --output deep-scan-results.json` : ''}
`;
  }

  /**
   * Generate .github/workflows/security-scan.yml file content
   */
  static generateWorkflowFile(config: GitHubActionsConfig): string {
    return this.generateWorkflow(config);
  }

  /**
   * Get GitHub Actions badge URL
   */
  static getBadgeUrl(owner: string, repo: string, workflow = "security-scan"): string {
    return `https://github.com/${owner}/${repo}/actions/workflows/${workflow}.yml/badge.svg`;
  }
}
