export default defineAppConfig({
  ui: {
    container: {
        base: "py-6 sm:py-8 lg:py-12", 
    },
    modal: {
      variants: {
        fullscreen: {
          false: {
            content: "max-w-3xl"
          }
        }
      }
    },
    form: {
      base: "flex flex-col gap-6",
    },
    formField: {
      slots: {
        root: "relative",
        wrapper: "absolute -top-2 left-0 z-2",
        labelWrapper: "h-6 z-2 overflow-visible pl-2",
        label: "text-xs"
      }
    },
    input: {
      slots: {
        root: "w-full",
        base: "!pt-3"
      }
    },
    select: {
      slots: {
        root: "w-full",
        base: "!pt-3"
      }
    },
    selectMenu: {
      slots: {
        root: "w-full",
        base: "!pt-3"
      }
    },
    textarea: {
      slots: {
        root: "w-full",
        base: "!pt-3"
      }
    }
  }
})