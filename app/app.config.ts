// Shared by every form control offering an `inverted` variant, so they stay
// visually identical on an inverted surface.
const invertedControl = {
  base: [
    "text-inverted bg-inverted ring ring-inset ring-default",
    "placeholder:text-inverted/60",
    // `base` sets focus:outline-none, so the variant must supply its own
    // focus indicator or the field becomes unreachable to keyboard users.
    "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-secondary",
  ],
  leadingIcon: "text-inverted/75",
  trailingIcon: "text-inverted/75",
};

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
      },
    },
    input: {
      slots: {
        root: "w-full",
        base: "!pt-3"
      },
      variants: {
        // Adds a value to the built-in `variant` prop: <UInput variant="inverted" />
        variant: { inverted: invertedControl },
      }
    },
    select: {
      slots: {
        root: "w-full",
        base: "!pt-3 w-full"
      }
    },
    selectMenu: {
      slots: {
        root: "w-full",
        base: "!pt-3 w-full"
      },
      // USelectMenu passes `variant` to its theme just like UInput does.
      variants: {
        variant: { inverted: invertedControl },
      }
    },
    textarea: {
      slots: {
        root: "w-full",
        base: "!pt-3 w-full"
      }
    },
    button: {
      compoundVariants: [
        {
          color: 'secondary',
          variant: 'solid',
          class: 'text-white font-bold'
        }
      ]
    }
  }
})