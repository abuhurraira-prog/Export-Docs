import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10 },
  header: { marginBottom: 20, textAlign: "center", fontSize: 16, fontWeight: "bold" },
  row: { flexDirection: "row", marginBottom: 5 },
  label: { width: "30%", fontWeight: "bold" },
  value: { width: "70%" },
  table: { marginTop: 20, borderWidth: 1, borderColor: "#000" },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#000" },
  tableHeader: { fontWeight: "bold", backgroundColor: "#f0f0f0" },
  tableCol: { flex: 1, padding: 5 },
});

export default function PackingListPDF({ shipment, buyer, items }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>PACKING LIST</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Buyer:</Text>
          <Text style={styles.value}>{buyer.companyName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Shipment #:</Text>
          <Text style={styles.value}>{shipment.shipmentNumber}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Port of Loading:</Text>
          <Text style={styles.value}>{shipment.portOfLoading || "N/A"}</Text>
        </View>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCol}>Description</Text>
            <Text style={styles.tableCol}>Quantity</Text>
            <Text style={styles.tableCol}>Unit</Text>
            <Text style={styles.tableCol}>Total</Text>
          </View>
          {items.map((item, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={styles.tableCol}>{item.description}</Text>
              <Text style={styles.tableCol}>{item.quantity}</Text>
              <Text style={styles.tableCol}>PCS</Text>
              <Text style={styles.tableCol}>{item.quantity}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}