<!-- <script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { listAllProducts } from '@/services/product/ProductService'
import { type IPaginatedResponseDto } from '@/services/product/dto/listProductsDto'

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

const products = ref<IPaginatedResponseDto>(defaultPaginatedResponse)

onMounted(async () => {
  try {
    const response = await listAllProducts({ filterValue: '', item: 'name', take: 10 })
    products.value = response.data
  } catch (error) {
    console.error('Erro ao obter produtos:', error)
  }
})
</script> -->

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
        :rows="10"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        :rowsPerPageOptions="[5, 10, 25]"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
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
          <small class="p-error" v-if="submitted && !product.name">Name is required.</small>
        </div>

        <div class="field">
          <label for="image">Imagem</label>
          <InputText
            id="image"
            v-model.trim="product.image"
            required="true"
            autofocus
            :class="{ 'p-invalid': submitted && !product.name }"
          />
          <small class="p-error" v-if="submitted && !product.name">Name is required.</small>
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
          </div>
        </div>

        <!-- <div class="field">
          <label for="inventoryStatus" class="mb-3">Inventory Status</label>
          <Dropdown
            id="inventoryStatus"
            v-model="product.inventoryStatus"
            :options="statuses"
            optionLabel="label"
            placeholder="Select a Status"
          >
            <template #value="slotProps">
              <div v-if="slotProps.value && slotProps.value.value">
                <Tag
                  :value="slotProps.value.value"
                  :severity="getStatusLabel(slotProps.value.label)"
                />
              </div>
              <div v-else-if="slotProps.value && !slotProps.value.value">
                <Tag :value="slotProps.value" :severity="getStatusLabel(slotProps.value)" />
              </div>
              <span v-else>
                {{ slotProps.placeholder }}
              </span>
            </template>
          </Dropdown>
        </div> -->

        <div class="grid" style="display: flex; flex-direction: row">
          <div class="col-6">
            <div class="field">
              <label for="price">Price</label>
              <InputNumber
                id="price"
                v-model="product.price"
                mode="currency"
                currency="USD"
                locale="en-US"
              />
            </div>
          </div>
          <div class="col-6">
            <div class="field">
              <label for="expiry_date">Data de Validade</label>
              <div class="card flex justify-content-center">
                <Calendar v-model="product.expiry_date" date-format="yy-mm-dd" />
              </div>
            </div>
          </div>
        </div>

        <div class="field">
          <label for="category">Categoria</label>
          <div class="card flex justify-content-center">
            <Dropdown
              v-model="product.category_id"
              :options="categories"
              optionLabel="name"
              option-value="id"
              placeholder="Selecione a Categoria"
              class="w-full md:w-14rem"
            />
          </div>
        </div>

        <template #footer>
          <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
          <Button label="Save" icon="pi pi-check" text @click="saveProduct" />
        </template>
      </Dialog>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { listAllProducts, saveNewProduct } from '@/services/product/ProductService'
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

const products = ref<IPaginatedResponseDto>(defaultPaginatedResponse)
const productDialog = ref(false)

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
const categories = ref<ICategory[]>([])
const selectedProducts = ref<IProduct[]>([])
const submitted = ref(false)

onMounted(async () => {
  try {
    const response = await listAllProducts({ filterValue: '', item: 'name', take: 10 })
    products.value = response.data

    const responseCategory = await listAllCategories()
    categories.value = responseCategory.data
  } catch (error) {
    console.error('Erro ao obter produtos:', error)
  }
})

const formatCurrency = (value: number) => {
  if (value)
    return value.toLocaleString('pt-Br', {
      style: 'currency',
      currency: 'BRL'
    })
  return
}

// const confirmDeleteSelected = () => {
//   deleteProductsDialog.value = true
// }

const openNew = () => {
  product.value = productDefaultData
  submitted.value = false
  productDialog.value = true
}

const hideDialog = () => {
  productDialog.value = false
  submitted.value = false
}

const saveProduct = async () => {
  submitted.value = true

  const { category_id, description, expiry_date, image, name, price } = product.value

  console.log('OIOIOIOIOI', expiry_date)

  try {
    const newProduct = await saveNewProduct({
      category_id,
      description,
      expiry_date,
      image,
      name,
      price
    })

    return console.log(newProduct)
  } catch (error) {
    console.error('Erro ao criar produto:', error)
  }

  productDialog.value = false
  product.value = productDefaultData
}
</script>
