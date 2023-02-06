import React, {useState, useEffect} from 'react'
import ReactDataGrid, { RowsChangeData, textEditor } from "react-data-grid";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { Product } from '../../interfaces/Product';
import { selectAllProducts, productsInitialize, updateProducts, createProduct, removeProduct } from "../../features/ProductSlice"
import ProductAPI from '../../api/ProductAPI';
import Button from 'react-bootstrap/Button';
import "bootstrap/dist/css/bootstrap.css";
import './ReactDataGridProduct.css';

function ProductUI() {
  const dispatch = useDispatch();
  const allProducts = useSelector(selectAllProducts);
  
  const [rows, setRows] =  useState<Product[]>([]);

  useEffect(() => {
    ProductAPI.getProductData().then(
      restAPIProducts => {
        dispatch(productsInitialize(restAPIProducts));
       }
    );
  }, []);

  
 
  
  const columns = [
      { key: "productName", name: "Product Name", editable: true, editor: textEditor, width: 200, resizable: true},
      { key: "description", name: "Description", editable: true, editor: textEditor, width: 700, resizable: true},
      {
        key: 'delete',
        name: 'Action',
        maxWidth: 35,
        formatter: (props : any) => (
          <Button onClick={() => handleRowDelete(props.row)}>X</Button>
        ),
      }
  ];

  async function handleRowDelete(row: Product) {
    const deleteThisProduct = {...row};

    const success = await ProductAPI.deleteProduct(deleteThisProduct.id);
    success && dispatch(removeProduct({id : deleteThisProduct.id}));
  }

  function rowKeyGetter(row: Product) {
    return row.id;
  }

  const updateProduct = async (changedProduct: Product) => {
    const productIndex = allProducts.findIndex(p => p.id === changedProduct.id);
  
    if (productIndex !== -1) {
      const tempProduct = {...changedProduct};  
      const restProduct = await ProductAPI.updateProduct(tempProduct);
      restProduct && dispatch(updateProducts({ id: restProduct.id, product: restProduct }));
    }
  };

  const handleUpdatedRows = (products : Product[], { indexes }: RowsChangeData<Product>) => {
    const changedProduct : Product = products[indexes[0]];
    updateProduct(changedProduct);
  };

  const addNewProduct = async (newProduct: Product) => {
    const tempProduct = {...newProduct};  

    const restProduct = await ProductAPI.createProduct(tempProduct);
    restProduct && dispatch(createProduct({product : restProduct}));
  };

  return (
      <div>
         <ReactDataGrid 
            columns={columns}
            rows={allProducts}
            rowKeyGetter={rowKeyGetter}
            onRowsChange={handleUpdatedRows}
            headerRowHeight={45}
            rowHeight={45}
          />
          <Button onClick={() => addNewProduct({ id: 0, productName: '', description: ''})}>Add Product</Button>
      </div>
    )
  }
  
  export default ProductUI