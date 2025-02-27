# TS Macro Plugins

## 安装

```shell
pnpm i -D @zinkawaii/tsm-plugins
```

## 使用方式

```ts
import { GotoDefinition } from "@zinkawaii/tsm-plugins";
import { defineConfig } from "ts-macro";

export default defineConfig({
  plugins: [
    GotoDefinition()
  ]
});
```

## 插件列表

### Goto Definition

在以下代码片段之间建立映射链接：

```ts
interface GlobalComponents {
  'Comp': typeof import('../app/components/comp.vue')['default'] /*
  ^^^^^^                                              ^^^^^^^^^  */
}

declare global {
  const computed: typeof import('vue')['computed'] /*
        ^^^^^^^^                       ^^^^^^^^^^  */
}
```

> `linkedCodeMapping` 能够使得在一个位置上触发的代码特性在另一个位置上再次触发，并合并两次触发的结果。

限制：由于映射链接与虚拟代码的生成位置强相关，因此对虚拟代码的其他更改可能导致该插件生成的映射链接完全错乱。