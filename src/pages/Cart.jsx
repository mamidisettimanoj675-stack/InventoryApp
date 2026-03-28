import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useInventory } from '../context/InventoryContext';
import '../styles/dashboard.css';

const Cart = () => {
  const { cartItems, totalAmount, removeFromCart, updateCartItemQuantity, clearCart } = useCart();
  const { decreaseQuantity } = useInventory();
  const [paymentData, setPaymentData] = useState({
    amount: totalAmount,
    paymentMethod: 'credit-card',
    fullPayment: true,
  });
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleQuantityChange = (productId, newQuantity) => {
    const quantity = Math.max(1, parseInt(newQuantity) || 1);
    updateCartItemQuantity(productId, quantity);
  };

  const handlePaymentInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPaymentData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value,
    }));
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    
    if (cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }

    const paymentAmount = paymentData.fullPayment ? totalAmount : paymentData.amount;

    if (paymentAmount <= 0 || paymentAmount > totalAmount) {
      alert(`Payment amount must be between 0 and ₹${totalAmount.toFixed(2)}`);
      return;
    }

    setPaymentProcessing(true);

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Decrease inventory quantities for each item in cart
      cartItems.forEach((item) => {
        decreaseQuantity(item.id, item.cartQuantity);
      });

      // Create order
      const order = {
        id: `ORD-${Date.now()}`,
        items: cartItems,
        totalAmount,
        paidAmount: paymentAmount,
        remainingAmount: totalAmount - paymentAmount,
        paymentMethod: paymentData.paymentMethod,
        isFullPayment: paymentData.fullPayment,
        date: new Date().toISOString(),
      };

      // Save order to localStorage
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      orders.push(order);
      localStorage.setItem('orders', JSON.stringify(orders));

      setPaymentSuccess(true);
      clearCart();

      // Reset form after 2 seconds
      setTimeout(() => {
        setPaymentSuccess(false);
        setPaymentData({
          amount: totalAmount,
          paymentMethod: 'credit-card',
          fullPayment: true,
        });
      }, 2000);
    } catch (err) {
      alert('Payment processing failed. Please try again.');
      console.error('Payment error:', err);
    } finally {
      setPaymentProcessing(false);
    }
  };

  if (paymentSuccess) {
    return (
      <div className="page-container">
        <div className="alert alert-success" style={{ marginTop: '2rem' }}>
          <h2>✓ Payment Processed Successfully!</h2>
          <p>Your order has been placed. Thank you for shopping with us.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container cart-page">
      <header className="page-header">
        <h1>Shopping Cart</h1>
        <p className="page-subtitle">Review and process your purchases</p>
      </header>

      <div className="cart-layout">
        {/* Cart Items Section */}
        <div className="cart-items-section">
          {cartItems.length === 0 ? (
            <div className="empty-state">
              <h2>Your cart is empty</h2>
              <p>Start shopping to add items to your cart</p>
            </div>
          ) : (
            <>
              <h2>Items in Cart ({cartItems.length})</h2>
              <div className="cart-items-list">
                {cartItems.map((item) => (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item-info">
                      <h3>{item.name}</h3>
                      <p className="sku">SKU: {item.sku}</p>
                      <p className="category">{item.category}</p>
                    </div>

                    <div className="cart-item-price">
                      <span className="label">Price:</span>
                      <span className="value">₹{item.price.toFixed(2)}</span>
                    </div>

                    <div className="cart-item-quantity">
                      <label htmlFor={`qty-${item.id}`}>Quantity:</label>
                      <input
                        id={`qty-${item.id}`}
                        type="number"
                        min="1"
                        value={item.cartQuantity}
                        onChange={(e) =>
                          handleQuantityChange(item.id, e.target.value)
                        }
                      />
                    </div>

                    <div className="cart-item-subtotal">
                      <span className="label">Subtotal:</span>
                      <span className="value">
                        ₹{(item.price * item.cartQuantity).toFixed(2)}
                      </span>
                    </div>

                    <button
                      className="btn btn-delete"
                      onClick={() => removeFromCart(item.id)}
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Payment Section */}
        {cartItems.length > 0 && (
          <div className="payment-section">
            <h2>Payment</h2>
            
            {/* Order Summary */}
            <div className="order-summary">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Tax (0%):</span>
                <span>₹0.00</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Form */}
            <form onSubmit={handleProcessPayment} className="payment-form">
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    name="fullPayment"
                    checked={paymentData.fullPayment}
                    onChange={handlePaymentInputChange}
                  />
                  Pay Full Amount
                </label>
              </div>

              {!paymentData.fullPayment && (
                <div className="form-group">
                  <label htmlFor="payment-amount">
                    Partial Payment Amount (₹)
                  </label>
                  <input
                    id="payment-amount"
                    type="number"
                    step="0.01"
                    name="amount"
                    value={paymentData.amount}
                    onChange={handlePaymentInputChange}
                    max={totalAmount}
                    min="0.01"
                  />
                  <small>
                    Remaining: ₹{(totalAmount - paymentData.amount).toFixed(2)}
                  </small>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="payment-method">Payment Method</label>
                <select
                  id="payment-method"
                  name="paymentMethod"
                  value={paymentData.paymentMethod}
                  onChange={handlePaymentInputChange}
                >
                  <option value="credit-card">Credit Card</option>
                  <option value="debit-card">Debit Card</option>
                  <option value="paypal">PayPal</option>
                  <option value="bank-transfer">Bank Transfer</option>
                </select>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={paymentProcessing}
              >
                {paymentProcessing ? 'Processing...' : `Pay ₹${(paymentData.fullPayment ? totalAmount : paymentData.amount).toFixed(2)}`}
              </button>
            </form>

            <button
              className="btn btn-secondary btn-block"
              onClick={clearCart}
              disabled={paymentProcessing}
            >
              Clear Cart
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
