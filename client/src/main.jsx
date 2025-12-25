import { createRoot } from 'react-dom/client'
import { RouterProvider } from "react-router-dom"
import { Provider } from "react-redux"
import router from './routes/router.jsx'
import { store } from "./redux/store.js"
import './index.css';

createRoot(document.getElementById('root')).render(
  // <StrictMode>
  //   <App />
  // </StrictMode>,

  <Provider store={store}>
    <RouterProvider router={router} />
  </Provider>


)
