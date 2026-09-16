<script setup lang="ts">
const wizard = useTemplateRef("wizard");

const scrollToWizard = () => {
  wizard.value?.$el.scrollIntoView({ behavior: "smooth", block: "start" });
};
</script>

<template>
  <div>
    <Parallax image="/img/parallax-bg.png">
      <UContainer class="flex flex-col justify-center gap-20 sm:gap-10">
        <h1 class="font-bold text-lg sm:text-2xl md:text-3xl text-center">
          Ingresa los datos del miembro ICCN para iniciar la búsqueda
        </h1>
        <MainMap />

        <SearchForm @search="wizard?.search($event)" />
      </UContainer>
    </Parallax>
    <section class="bg-inverted">
      <SearchWizzard ref="wizard" @scroll-wizzard="scrollToWizard" />
    </section>
  </div>
</template>
