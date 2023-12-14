<template>
  <div>
    <div class="card">
      <Toolbar class="mb-4">
        <template #start>
          <Button label="New" icon="pi pi-plus" severity="success" class="mr-2" @click="openNew" />
          <!-- <Button
            label="Delete"
            icon="pi pi-trash"
            severity="danger"
            @click="confirmDeleteSelected"
            :disabled="!selectedProducts || !selectedProducts.length"
          /> -->
        </template>
      </Toolbar>

      <DataTable
        ref="dt"
        :value="products.data"
        v-model:selection="selectedProducts"
        dataKey="id"
        :paginator="true"
        :total-records="products.to"
        :rows="takeTable"
        v-on:value-change="changeTable"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        :rowsPerPageOptions="[5, 10, 25]"
        currentPageReportTemplate="{first} para {last} de {totalRecords}"
      >
        <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
        <Column field="name" header="Nome" sortable style="min-width: 16rem"></Column>
        <Column field="description" header="Descrição" sortable style="min-width: 10rem"></Column>
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
        <Column field="category_id" header="Categoria" sortable style="min-width: 10rem"></Column>
        <Column
          field="created_at"
          header="Data de criação"
          sortable
          style="min-width: 10rem"
        ></Column>
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
              @click="editProduct(slotProps.data)"
            />
            <Button
              icon="pi pi-trash"
              outlined
              rounded
              severity="danger"
              @click="confirmDeleteProduct(slotProps.data)"
            />
          </template>
        </Column>
      </DataTable>

      <Dialog
        v-model:visible="productDialog"
        :style="{ width: '450px' }"
        header="Detalhes do Produto"
        :modal="true"
        class="p-fluid"
      >
        <div class="field">
          <label for="name">Name</label>
          <InputText
            id="name"
            v-model.trim="product.name"
            required="true"
            autofocus
            :class="{ 'p-invalid': submitted && !product.name }"
          />
          <small class="p-error" v-if="submitted && !product.name">Campo obrigatório.</small>
        </div>

        <div class="field">
          <label for="description">Descrição</label>
          <div>
            <!-- <Textarea
              id="description"
              v-model="product.description"
              required="true"
              rows="3"
              cols="20"
              style="min-width: 100%; max-width: 100%; min-height: 2rem"
            /> -->
            <InputText
              id="description"
              v-model.trim="product.description"
              required="true"
              autofocus
              :class="{ 'p-invalid': submitted && !product.description }"
            />
            <small class="p-error" v-if="submitted && !product.description"
              >Campo obrigatório.</small
            >
          </div>
        </div>

        <div class="grid" style="display: flex; flex-direction: row">
          <div class="field">
            <label for="price">Price</label>
            <InputNumber
              id="price"
              v-model="product.price"
              mode="currency"
              currency="USD"
              locale="en-US"
            />
            <small class="p-error" v-if="submitted && !product.price">Campo obrigatório.</small>
          </div>

          <div class="field">
            <label for="expiry_date">Data de Validade</label>
            <Calendar v-model="product.expiry_date" date-format="dd/mm/yy" />
            <small class="p-error" v-if="submitted && !product.expiry_date"
              >Campo obrigatório.</small
            >
          </div>
        </div>

        <div class="field">
          <label for="category">Categoria</label>
          <Dropdown
            v-model="product.category_id"
            :options="categories"
            optionLabel="name"
            option-value="id"
            placeholder="Selecione a Categoria"
            class="w-full md:w-14rem"
          />
          <small class="p-error" v-if="submitted && !product.category_id"
            >Seleção obrigatória.</small
          >
        </div>

        <div class="field">
          <label for="image">Imagem</label>
          <InputText
            id="image"
            v-model.trim="product.image"
            required="true"
            autofocus
            :class="{ 'p-invalid': submitted && !product.image }"
          />
          <small class="p-error" v-if="submitted && !product.image">Campo obrigatório.</small>
        </div>

        <template #footer>
          <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
          <Button label="Save" icon="pi pi-check" text @click="saveProduct" />
        </template>
      </Dialog>

      <Dialog
        v-model:visible="deleteProductDialog"
        :style="{ width: '450px' }"
        header="Confirm"
        :modal="true"
      >
        <div class="confirmation-content">
          <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
          <span v-if="product"
            >Apagar permanentemente: <b>{{ product.name }}</b
            >?</span
          >
        </div>
        <template #footer>
          <Button label="No" icon="pi pi-times" text @click="deleteProductDialog = false" />
          <Button label="Yes" icon="pi pi-check" text @click="removeProduct" />
        </template>
      </Dialog>
      <Toast />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import {
  listAllProducts,
  saveNewProduct,
  deleteProduct,
  updateProduct
} from '@/services/product/ProductService'
import { listAllCategories } from '@/services/category/categoryServices'
import { type ICategory } from '@/services/category/dto/categoryDto'
import { type IPaginatedResponseDto } from '@/services/product/dto/listProductsDto'
import { type IProduct } from '@/services/product/dto/productDto'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Toolbar from 'primevue/toolbar'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Calendar from 'primevue/calendar'
import Dropdown from 'primevue/dropdown'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
const toast = useToast()

// function onChange(event: any) {
//   takeTable.value = event?.rows
//   fetchAll()
// }

const show = () => {
  toast.add({ severity: 'info', summary: 'Info', detail: 'Message Content', life: 3000 })
}

const dateFormatter = (date: Date) => {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}

const defaultPaginatedResponse: IPaginatedResponseDto = {
  current_page: 1,
  data: [],
  first_page_url: '',
  from: 1,
  last_page: 1,
  last_page_url: '',
  links: [],
  next_page_url: null,
  path: '',
  per_page: 10,
  prev_page_url: null,
  to: 1,
  total: 0
}

const productDefaultData: IProduct = {
  category_id: '',
  created_at: new Date(),
  description: '',
  expiry_date: '',
  id: '',
  image: '',
  name: '',
  price: 0,
  updated_at: new Date()
}

const product = ref<IProduct>(productDefaultData)
const products = ref<IPaginatedResponseDto>(defaultPaginatedResponse)
const productDialog = ref(false)
const selectedProducts = ref<IProduct[]>([])

const editProduct = (prod: any) => {
  product.value = { ...prod }
  productDialog.value = true
}

const deleteProductDialog = ref(false)
const confirmDeleteProduct = (prod: any) => {
  product.value = prod
  deleteProductDialog.value = true
}

async function removeProduct() {
  try {
    await deleteProduct(product.value.id)
    show()
    fetchAll()
    deleteProductDialog.value = false
  } catch (error) {
    console.error('Erro ao deletar produto:', error)
  }
  // toast.add({ severity: 'success', summary: 'Successful', detail: 'Product Deleted', life: 3000 })
}

const submitted = ref(false)

const categories = ref<ICategory[]>([])

const takeTable = ref(5)
const pageTable = ref(1)

function changeTable(event: any) {
  takeTable.value = event?.rows
  fetchAll()
}

async function fetchAll() {
  try {
    const response = await listAllProducts({
      filterValue: '',
      item: 'name',
      take: takeTable.value,
      page: pageTable.value
    })
    products.value = response.data

    const responseCategory = await listAllCategories()
    categories.value = responseCategory.data
  } catch (error) {
    console.error('Erro ao obter produtos:', error)
  }
}

onMounted(async () => {
  fetchAll()
})

const formatCurrency = (value: number) => {
  if (value)
    return value.toLocaleString('pt-Br', {
      style: 'currency',
      currency: 'BRL'
    })
  return
}

function clearProductFields() {
  product.value = { ...productDefaultData }
}

const openNew = () => {
  clearProductFields()
  submitted.value = false
  productDialog.value = true
}

const hideDialog = () => {
  clearProductFields()
  productDialog.value = false
  submitted.value = false
}

const isFormValid = computed(() => {
  const { category_id, description, expiry_date, image, name, price } = product.value
  return category_id && description && expiry_date && image && name && price !== null
})

const saveProduct = async () => {
  submitted.value = true

  if (isFormValid.value) {
    const { category_id, description, expiry_date, image, name, price } = product.value

    try {
      if (product.value.id) {
        // editing
        await updateProduct(product.value.id, {
          category_id,
          description,
          expiry_date: dateFormatter(new Date(expiry_date)),
          image,
          name,
          price
        })
      } else {
        await saveNewProduct({
          category_id,
          description,
          expiry_date: dateFormatter(new Date(expiry_date)),
          image,
          name,
          price
        })
      }
      show()
      fetchAll()
      hideDialog()
    } catch (error) {
      console.error('Erro ao criar produto:', error)
    }
  }
}
</script>
