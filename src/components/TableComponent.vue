<template>
  <Toolbar class="mb-4">
    <template #start>
      <div class="flex flex-wrap gap-2 align-items-center justify-content-between">
        <h4 class="m-0">Gerenciamento de Produtos</h4>
        <span class="p-input-icon-left">
          <i class="pi pi-search" />
          <InputText v-model="filters['global'].value" placeholder="Search..." />
        </span></div
    ></template>
    <template #end>
      <Button label="Login" severity="help" class="mr-2" @click="getToken" v-show="!isAuth" />
      <Button label="Deslogar" severity="help" class="mr-2" @click="removeToken" v-show="isAuth" />
      <Button
        label="New"
        icon="pi pi-plus"
        severity="success"
        class="mr-2"
        @click="emitOpenNewDialogEvent"
      />
    </template>
  </Toolbar>
  <DataTable
    ref="dt"
    :value="products?.data"
    dataKey="id"
    :paginator="true"
    :filters="filters"
    :total-records="products?.to"
    :rows="10"
    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
    :rowsPerPageOptions="[5, 10, 25]"
    currentPageReportTemplate="{last} de {totalRecords}"
  >
    <Column field="name" header="Nome" sortable style="min-width: 16rem"></Column>
    <Column field="description" header="Descrição" sortable style="min-width: 10rem"></Column>
    <Column header="Imagem">
      <template #body="slotProps">
        <img
          :src="slotProps.data.imageUrl"
          :alt="slotProps.data.image"
          class="shadow-2 border-round"
          style="width: 64px"
        />
      </template>
    </Column>

    <Column field="price" header="Preço" sortable style="min-width: 8rem">
      <template #body="slotProps">
        {{ formatCurrency(slotProps.data.price) }}
      </template>
    </Column>
    <Column
      field="expiry_date"
      header="Data de validade"
      sortable
      style="min-width: 10rem"
    ></Column>
    <Column field="category.name" header="Categoria" sortable style="min-width: 10rem"></Column>
    <Column field="created_at" header="Data de criação" sortable style="min-width: 10rem"></Column>
    <Column
      field="updated_at"
      header="Data da Última atualização"
      sortable
      style="min-width: 10rem"
    ></Column>
    <Column :exportable="false" style="min-width: 8rem">
      <template #body="slotProps">
        <Button
          icon="pi pi-pencil"
          style=""
          outlined
          rounded
          class="mr-2"
          @click="emitEditEvent(slotProps.data)"
        />
        <Button
          icon="pi pi-trash"
          outlined
          rounded
          severity="danger"
          @click="emitDeleteEvent(slotProps.data)"
        />
      </template>
    </Column>
  </DataTable>
</template>

<script lang="ts" setup>
import { ref, defineEmits, defineProps } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import { type IPaginatedResponseDto } from '@/services/product/dto/listProductsDto'
import { FilterMatchMode } from 'primevue/api'
import Toolbar from 'primevue/toolbar'
import InputText from 'primevue/inputtext'
import { login } from '@/services/auth/authService'

const { products } = defineProps({
  products: Object as () => IPaginatedResponseDto
})

const isAuth = ref(false)

async function getToken() {
  const response = await login({ email: 'master@example.com', password: 'masterpassword' })

  if (response.data) {
    sessionStorage.setItem('authToken', response.data.token)
    isAuth.value = true
  }
}

function removeToken() {
  sessionStorage.removeItem('authToken')
  isAuth.value = false
}

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
})

function formatCurrency(value: number) {
  if (value) {
    return value.toLocaleString('pt-Br', {
      style: 'currency',
      currency: 'BRL'
    })
  }
}

const emitToParent = defineEmits(['editProductEmit', 'deleteProductEmit', 'openNewDialogEmit'])

function emitEditEvent(productData: any) {
  emitToParent('editProductEmit', productData)
}

function emitDeleteEvent(productData: any) {
  emitToParent('deleteProductEmit', productData)
}

function emitOpenNewDialogEvent() {
  emitToParent('openNewDialogEmit')
}
</script>
