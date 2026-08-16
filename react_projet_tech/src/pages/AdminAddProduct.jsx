import React, { useState, useEffect } from "react";

export default function AdminAddProduct() {
  const [subCategories, setSubCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categoryAttributes, setCategoryAttributes] = useState([]);

  // პროდუქტის ძირითადი State
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    discount_price: "",
    brand_id: "",
    stock: 100,
    image: "",
    description: "",
  });

  // დინამიური ატრიბუტების State: { attribute_id: "value" }
  const [attributeValues, setAttributeValues] = useState({});

  // 1. წამოვიღოთ ქვეკატეგორიები და ბრენდები ჩამოშლილი სიისთვის (Dropdown)
  useEffect(() => {
    // ქვეკატეგორიების წამოღება
    fetch("http://localhost:5001/api/categories/all-subcategories")
      .then((res) => res.json())
      .then((data) => setSubCategories(data))
      .catch((err) => console.error(err));
  }, []);

  // 2. როცა კატეგორიას ავირჩევთ, წამოვიღოთ იმ კატეგორიის ატრიბუტები
  const handleCategoryChange = (e) => {
    const catId = e.target.value;
    setSelectedCategory(catId);
    setAttributeValues({}); // გასუფთავება

    if (catId) {
      fetch(`http://localhost:5001/api/categories/category-attributes/${catId}`)
        .then((res) => res.json())
        .then((data) => setCategoryAttributes(data))
        .catch((err) => console.error(err));
    } else {
      setCategoryAttributes([]);
    }
  };

  // ინფუთების ცვლილების მართვა
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ატრიბუტის ინფუთების ცვლილება
  const handleAttrChange = (attrId, val) => {
    setAttributeValues((prev) => ({ ...prev, [attrId]: val }));
  };

  // 3. ფორმის გაგზავნა
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ატრიბუტების ფორმატირება ბექენდისთვის
    const formattedAttributes = Object.entries(attributeValues).map(
      ([attrId, val]) => ({
        attribute_id: Number(attrId),
        value: val,
      }),
    );

    const payload = {
      ...formData,
      category_id: Number(selectedCategory),
      brand_id: formData.brand_id ? Number(formData.brand_id) : null,
      price: Number(formData.price),
      discount_price: formData.discount_price
        ? Number(formData.discount_price)
        : null,
      stock: Number(formData.stock),
      attributes: formattedAttributes,
      lang: "en",
    };

    try {
      const res = await fetch(
        "http://localhost:5001/api/categories/add-product",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();

      if (res.ok) {
        alert("🎉 პროდუქტი წარმატებით დაემატა!");
        // ფორმის გასუფთავება
        setFormData({
          name: "",
          price: "",
          discount_price: "",
          brand_id: "",
          stock: 10,
          image: "",
          description: "",
        });
        setAttributeValues({});
      } else {
        alert("შეცდომა: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("სერვერთან კავშირი ვერ დამყარდა");
    }
  };

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "20px auto",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
      }}
    >
      <h2>🛒 ახალი პროდუქტის დამატება (Admin)</h2>

      <form onSubmit={handleSubmit}>
        {/* კატეგორიის არჩევა */}
        <div style={{ marginBottom: "15px" }}>
          <label>
            <b>აირჩიეთ ქვეკატეგორია:*</b>
          </label>
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            required
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          >
            <option value="">-- აირჩიეთ --</option>
            {subCategories.map((sub) => (
              <option key={sub.sub_id} value={sub.sub_id}>
                {sub.parent_name} {">"} {sub.sub_name}
              </option>
            ))}
          </select>
        </div>

        {/* დასახელება */}
        <div style={{ marginBottom: "15px" }}>
          <label>პროდუქტის დასახელება:*</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        {/* ფასები */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
          <div style={{ flex: 1 }}>
            <label>ფასი (₾):*</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              required
              style={{ width: "100%", padding: "8px" }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label>ფასდაკლებული ფასი (₾):</label>
            <input
              type="number"
              name="discount_price"
              value={formData.discount_price}
              onChange={handleInputChange}
              style={{ width: "100%", padding: "8px" }}
            />
          </div>
        </div>

        {/* სურათის URL და მარაგში რაოდენობა */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
          <div style={{ flex: 2 }}>
            <label>სურათის სახელი/Path (მაგ: products/samsung.webp):</label>
            <input
              type="text"
              name="image"
              value={formData.image}
              onChange={handleInputChange}
              style={{ width: "100%", padding: "8px" }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label>მარაგი (Stock):</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleInputChange}
              style={{ width: "100%", padding: "8px" }}
            />
          </div>
        </div>

        {/* დინამიური ატრიბუტების სექცია */}
        {categoryAttributes.length > 0 && (
          <div
            style={{
              background: "#f9f9f9",
              padding: "15px",
              borderRadius: "5px",
              marginBottom: "15px",
            }}
          >
            <h4>⚙️ კატეგორიის ატრიბუტები:</h4>
            {categoryAttributes.map((attr) => (
              <div key={attr.attribute_id} style={{ marginBottom: "10px" }}>
                <label>{attr.attribute_name}:</label>
                <input
                  type="text"
                  placeholder={`შეიყვანეთ ${attr.attribute_name}`}
                  value={attributeValues[attr.attribute_id] || ""}
                  onChange={(e) =>
                    handleAttrChange(attr.attribute_id, e.target.value)
                  }
                  style={{ width: "100%", padding: "6px", marginTop: "3px" }}
                />
              </div>
            ))}
          </div>
        )}

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "12px",
            background: "#28a745",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          პროდუქტის ბაზაში დამატება 🚀
        </button>
      </form>
    </div>
  );
}
