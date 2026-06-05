# PetPal 文档索引

这个目录只保留当前阶段仍然有参考价值的材料，避免 Claude 或后续开发者被早期草案误导。

## 当前有效文档

- `launch-readiness.md`：上线前合规、技术、内容安全与阻塞项清单。
- `staging-deploy.md`：Staging 环境部署、迁移、回滚与监控说明。

## 代码入口

- `../README.md`：项目说明、开发启动、账号、环境变量与目录结构。
- `../.env.example`：本地、Staging、Production 需要配置的环境变量模板。
- `../prisma/schema.prisma`：数据模型与数据库 Provider 切换说明。

## 清理原则

- 已落地代码优先于旧方案文档。
- V1 已确认不用或未注册的文件不保留在主目录。
- 历史方案如需追溯，优先从 Git 历史查看，而不是继续堆在 `docs/` 里。
