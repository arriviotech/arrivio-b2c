import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        padding: 50,
        fontSize: 9,
        fontFamily: 'Helvetica',
        color: '#0f4c3a',
        lineHeight: 1.4,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottomWidth: 2,
        borderBottomColor: '#0f4c3a',
        paddingBottom: 15,
        marginBottom: 20,
    },
    headerText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    logo: {
        fontSize: 24,
        fontWeight: 'bold',
        fontStyle: 'italic',
        color: '#3E6B4E',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
        textTransform: 'uppercase',
    },
    subTitle: {
        fontSize: 10,
        textAlign: 'center',
        marginBottom: 20,
        fontStyle: 'italic',
        color: '#666',
    },
    section: {
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
        paddingBottom: 2,
        marginBottom: 8,
        marginTop: 10,
    },
    grid: {
        flexDirection: 'row',
        gap: 20,
        marginBottom: 10,
    },
    gridCol: {
        flex: 1,
    },
    partiesBox: {
        backgroundColor: '#F9F9F9',
        padding: 10,
        borderRadius: 5,
    },
    partyTitle: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#888',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    financialBox: {
        borderWidth: 1,
        borderColor: '#0f4c3a',
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    financialBoxGold: {
        borderWidth: 1,
        borderColor: '#186b53',
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    currency: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#DDD',
    },
    amount: {
        fontSize: 11,
        fontWeight: 'bold',
    },
    bodyText: {
        marginBottom: 6,
        textAlign: 'justify',
    },
    bold: {
        fontWeight: 'bold',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 50,
        right: 50,
        borderTopWidth: 1,
        borderTopColor: '#EEE',
        paddingTop: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        fontSize: 7,
        color: '#AAA',
    },
    signatureContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 40,
        gap: 60,
    },
    signatureBox: {
        flex: 1,
        borderBottomWidth: 1,
        borderBottomColor: '#CCC',
        textAlign: 'center',
        paddingBottom: 5,
        height: 40,
        justifyContent: 'center',
    },
    signatureLabel: {
        fontSize: 8,
        marginTop: 5,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    annexTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#0f4c3a',
        paddingBottom: 4,
    }
});

const ContractPDF = ({ property, booking, docId }) => (
    <Document title="Demo Contract">
        {/* PAGE 1: Core Agreement */}
        <Page size="A4" style={styles.page}>


            <Text style={styles.title}>Residential Rental Agreement</Text>
            <Text style={styles.subTitle}>This is a document preview. All details are subject to final verification.</Text>

            <Text style={styles.bodyText}>
                This Residential Rental Agreement ("Agreement") is entered into between <Text style={styles.bold}>Arrivio</Text> ("Landlord") and the undersigned Tenant. Arrivio owns, manages, and operates the rental property directly. This Agreement is governed by German law and shall be interpreted in accordance with the German Civil Code (BGB).
            </Text>

            {/* 1. Contracting Parties */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>1. Contracting Parties</Text>
                <View style={styles.grid}>
                    <View style={[styles.gridCol, styles.partiesBox]}>
                        <Text style={styles.partyTitle}>Landlord</Text>
                        <Text style={styles.bold}>Arrivio</Text>
                        <Text style={{ fontSize: 8, color: '#666' }}>Registered Address: __________________________</Text>
                        <Text style={{ fontSize: 8, color: '#666' }}>Email: __________________________</Text>
                        <Text style={{ fontSize: 8, color: '#666' }}>Phone: __________________________</Text>
                    </View>
                    <View style={[styles.gridCol, styles.partiesBox]}>
                        <Text style={styles.partyTitle}>Tenant</Text>
                        <Text style={{ marginBottom: 4 }}>Name: __________________________</Text>
                        <Text style={{ marginBottom: 4 }}>Date of Birth: __________________________</Text>
                        <Text style={{ marginBottom: 4 }}>Passport/ID No.: __________________________</Text>
                        <Text>Current Address: __________________________</Text>
                    </View>
                </View>
            </View>

            {/* 2. Rental Property */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>2. Rental Property</Text>
                <Text style={styles.bodyText}>Address: <Text style={styles.bold}>{property.address}</Text></Text>
                <View style={{ flexDirection: 'row', gap: 20, marginTop: 5 }}>
                    <Text>Apartment: {property.apartmentNo || "________________"}</Text>
                    <Text>Floor: {property.floor}</Text>
                    <Text>Size: {property.size} m²</Text>
                </View>
                <Text style={{ fontSize: 8, marginTop: 5, color: '#666' }}>
                    The apartment is rented furnished and fully equipped. An inventory list forms Annex 1 to this Agreement.
                </Text>
            </View>

            {/* 3. Lease Term */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>3. Lease Term</Text>
                <View style={{ flexDirection: 'row', gap: 40, backgroundColor: '#F9F9F9', padding: 10, borderRadius: 5, justifyContent: 'center' }}>
                    <View style={{ alignItems: 'center' }}>
                        <Text style={styles.partyTitle}>Start Date</Text>
                        <Text style={styles.bold}>{booking.checkIn}</Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                        <Text style={styles.partyTitle}>End Date</Text>
                        <Text style={styles.bold}>{booking.checkOut}</Text>
                    </View>
                </View>
                <Text style={{ fontSize: 8, marginTop: 5, color: '#666' }}>
                    Automatic extension pursuant to §545 BGB is excluded unless expressly agreed in writing. Continuation beyond the agreed term requires a written extension agreement.
                </Text>
            </View>

            {/* 4. Rent and Payment Terms */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>4. Rent and Payment Terms</Text>
                <View style={styles.grid}>
                    <View style={styles.gridCol}>
                        <View style={styles.financialBox}>
                            <Text style={styles.currency}>EUR</Text>
                            <Text style={styles.amount}>{booking.totalMonthly}</Text>
                        </View>
                        <Text style={{ fontSize: 7, textAlign: 'center' }}>TOTAL MONTHLY RENT (WARM)</Text>
                    </View>
                    <View style={styles.gridCol}>
                        <View style={styles.financialBoxGold}>
                            <Text style={[styles.currency, { color: '#F3E5D3' }]}>EUR</Text>
                            <Text style={[styles.amount, { color: '#186b53' }]}>{booking.deposit}</Text>
                        </View>
                        <Text style={{ fontSize: 7, textAlign: 'center', color: '#186b53' }}>SECURITY DEPOSIT</Text>
                    </View>
                </View>
                <View style={{ fontSize: 8, color: '#666', marginTop: 5 }}>
                    <Text>• Cold Rent: €{booking.monthlyRent} | Utility Lump Sum: €{booking.utilities}</Text>
                    <Text>• One-Time Fees: Booking (€{booking.bookingFee}) | Cleaning (€{booking.cleaningFee})</Text>
                    <Text style={{ marginTop: 3 }}>
                        Rent is payable in advance no later than the third working day of each month. Security deposit (max 3 months cold rent per §551 BGB) must be paid before move-in. The deposit will be returned within five weeks after termination, subject to settlement of outstanding claims.
                    </Text>
                </View>
            </View>

            <Text style={styles.footer}>PAGE 1 OF 2 • ARRIVIO PROPERTY MANAGEMENT • DOC ID: {docId}</Text>
        </Page>

        {/* PAGE 2: Legal Clauses & Annexes */}
        <Page size="A4" style={styles.page}>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>5. Utilities and Operating Costs</Text>
                <Text style={styles.bodyText}>
                    The utility lump sum includes operating costs as defined under the German Operating Costs Ordinance (BetrKV), including heating, water, electricity, internet, and building maintenance. If actual consumption significantly exceeds average usage, Arrivio reserves the right to invoice additional costs. Increases in operating costs after commencement of the lease may be passed on proportionally with written notice.
                </Text>

                <Text style={styles.sectionTitle}>6. Use of Property</Text>
                <Text style={styles.bodyText}>
                    The premises may be used exclusively for residential purposes. Subletting or commercial use without prior written consent is prohibited. Violation constitutes grounds for extraordinary termination.
                </Text>

                <Text style={styles.sectionTitle}>7. Maintenance and Repairs</Text>
                <Text style={styles.bodyText}>
                    The Tenant shall maintain the premises in proper condition and report defects within 48 hours of move-in. Structural alterations require prior written approval. The Tenant is liable for damages caused by negligent or intentional conduct.
                </Text>

                <Text style={styles.sectionTitle}>8. Entry of the Premises</Text>
                <Text style={styles.bodyText}>
                    Arrivio may enter the apartment with reasonable notice for inspection, repairs, or maintenance. During the final 45 days of the lease term, viewings may be conducted at reasonable times. Immediate access is permitted in emergencies.
                </Text>

                <Text style={styles.sectionTitle}>9. Liability</Text>
                <Text style={styles.bodyText}>
                    Arrivio shall only be liable for damages caused by intent or gross negligence, or for injury to life, body, or health. Liability for force majeure events such as natural disasters, power outages, or internet failure is excluded. If damage occurs within the area exclusively used by the Tenant, the Tenant bears the burden of proof that no fault exists.
                </Text>

                <Text style={styles.sectionTitle}>10. Termination</Text>
                <Text style={styles.bodyText}>
                    The Tenant may terminate the Agreement with statutory notice pursuant to §573c BGB unless otherwise agreed. Arrivio may terminate without notice in case of serious breach, including payment default exceeding 15 days. All terminations must be made in writing.
                </Text>

                <Text style={styles.sectionTitle}>11. Return of the Premises</Text>
                <Text style={styles.bodyText}>
                    The apartment must be returned clean, undamaged, and with all keys by 10:00 AM on the final day of tenancy. Professional cleaning costs may be charged if the apartment is not returned in proper condition.
                </Text>

                <Text style={styles.sectionTitle}>12. Right of Withdrawal</Text>
                <Text style={styles.bodyText}>
                    If this Agreement is concluded remotely, the Tenant has the right to withdraw within fourteen days without giving any reason pursuant to §§312g, 355 BGB. Refunds will be processed within fourteen days of receiving the withdrawal notice.
                </Text>

                <Text style={styles.sectionTitle}>13. Data Protection (GDPR)</Text>
                <Text style={styles.bodyText}>
                    Personal data is processed for the purpose of fulfilling this Agreement in accordance with Article 6(1)(b) GDPR. Data may be shared with service providers, banks, insurance companies, authorities, and maintenance contractors where necessary. The Tenant has the right to access, rectify, erase, restrict processing, and lodge complaints with a supervisory authority. Data will be stored only as long as required for contractual or statutory retention purposes.
                </Text>
            </View>

            {/* Signatures */}
            <View style={styles.signatureContainer}>
                <View style={{ flex: 1 }}>
                    <View style={styles.signatureBox}>
                        <Text style={{ color: '#EEE', fontSize: 12 }}>ARIVIO OFFICIAL</Text>
                    </View>
                    <Text style={styles.signatureLabel}>Arrivio (Landlord)</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <View style={styles.signatureBox}>
                        <Text style={{ color: '#CCC', fontSize: 10 }}>Digital Signature Pending</Text>
                    </View>
                    <Text style={styles.signatureLabel}>Tenant</Text>
                </View>
            </View>

            <Text style={styles.footer}>PAGE 2 OF 2 • ARRIVIO PROPERTY MANAGEMENT • DOC ID: {docId}</Text>
        </Page>

        {/* PAGE 3: Annexes */}
        <Page size="A4" style={styles.page}>
            <Text style={styles.title}>Contract Annexes</Text>

            <Text style={styles.annexTitle}>Annex 1 – Inventory List</Text>
            <Text style={styles.bodyText}>Detailed inventory including furniture, appliances, keys, and condition report at move-in.</Text>

            <Text style={styles.annexTitle}>Annex 2 – House Rules</Text>
            <View style={{ marginLeft: 10 }}>
                <Text style={styles.bodyText}>• Quiet hours between 22:00 and 07:00.</Text>
                <Text style={styles.bodyText}>• Proper waste separation required.</Text>
                <Text style={styles.bodyText}>• No smoking unless otherwise agreed.</Text>
                <Text style={styles.bodyText}>• Pets require written approval.</Text>
                <Text style={styles.bodyText}>• Proper ventilation required to prevent mold.</Text>
            </View>

            <Text style={styles.annexTitle}>Annex 3 – Payment Plan</Text>
            <View style={{ marginLeft: 10 }}>
                <Text style={styles.bodyText}>• Down payment includes first month rent, booking fee, and cleaning fee.</Text>
                <Text style={styles.bodyText}>• Subsequent monthly payments due on the first working day of each month.</Text>
                <Text style={styles.bodyText}>• Bank details and payment reference instructions provided by Arrivio.</Text>
            </View>

            <Text style={styles.annexTitle}>Annex 4 – Revocation Form Template</Text>
            <Text style={styles.bodyText}>Sample form allowing Tenant to withdraw within fourteen days of contract conclusion.</Text>

            <View style={{ marginTop: 50, padding: 20, borderStyle: 'dashed', borderWidth: 1, borderColor: '#EEE', textAlign: 'center' }}>
                <Text style={{ fontSize: 10, color: '#AAA', fontWeight: 'bold' }}>END OF DOCUMENT</Text>
            </View>

            <Text style={styles.footer}>PAGE 3 • ARRIVIO PROPERTY MANAGEMENT • DOC ID: {docId}</Text>
        </Page>
    </Document>
);

export default ContractPDF;
