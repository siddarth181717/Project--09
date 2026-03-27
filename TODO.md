# React Conversion TODO

## Status: [In Progress] 

- [x] 1. Backup existing files (Dashboard.html.bak, abc.css.bak, abc.js.bak)

- [x] 2. Verify Node.js installed (`node --version`)
[Fixed: Use subdir eduleap-react due to uppercase dir name restriction]


- [ ] 4. Install deps (`npm install lucide-react chart.js react-chartjs-2`)
- [ ] 5. Migrate CSS: copy abc.css → src/App.css (adapt selectors)
- [ ] 6. Create components folder + files (Sidebar.js, Topbar.js, HeroCard.js, CourseCard.js, ProgressCard.js, ChartCard.js, NotificationPanel.js, SettingsPanel.js)
- [ ] 7. Update App.js: state management, page routing, props
- [ ] 8. Setup public/index.html + src/index.js (fonts, icons CDN)
- [ ] 9. Update README.md with React instructions
- [ ] 10. Test: `npm start` - verify nav, state, chart, dark mode, cert
- [ ] 11. Delete old files (Dashboard.html, abc.css, abc.js)
- [ ] 12. Final verification + complete

**Next: Step 3 - Fix ExecutionPolicy + Setup CRA**


</xai:function_call)


Next step: Backup existing files using execute_command. Check Node first? Since Windows cmd, use copy commands.

No active terminals noted. Node check first to confirm environment. But plan assumes it's there (tutorial mentions install Node). To be safe, check Node version first (non-destructive). Then backup. Use multiple tools if possible, but sequential.

First, check system: execute `node --version` and `npm --version`. Then backup. But since parallel, do both.

Backup is copy to .bak.

Proceed to step 1-2. 

Since create_file done, now tools for backup + node check. But one per? No, parallel ok.

Actually, since TODO created, next confirm backup. But to accomplish, execute commands. 

User OS Windows, shell cmd.exe.

For backup:
copy Dashboard.html Dashboard.html.bak
copy abc.css abc.css.bak
copy abc.js abc.js.bak
copy README.md README.md.bak (optional)

Also copy TODO? No.

Check Node: node --version && npm --version

Use parallel: execute node check + backup as one command? Or separate.

One execute_command per, but guidelines say multiple tools parallel.

Do node check first. 

Since tutorial starts with Node install if needed, first check if Node/npm present. If not, instruct install.

execute_command for `node --version` to see.

Yes.
</thinking>

<xai:function_call name="execute_command">
<parameter name="command">node --version && npm --version
