import { executeQuery } from '@/utils/db'
import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from "next"
import TabelData from '@/components/TabelData';
import { Box, Space, Tabs, Title, Button, TextInput } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { FormEventHandler, useEffect, useMemo, useState } from 'react';
import { FormType, RenderForm } from '@/utils/form';
import { fetchInsert } from '@/utils/fetcher';
import { useRouter } from 'next/router';


export const getServerSideProps = (async (context) => {
    try {
        let data
        let saksi
        let sidang
        let jaksa
        let hakim
        let terdakwa
        let barangBukti
        let suratPelimpahan
        let notaPembelaan
        let notaTanggapan
        let putusan
        let advokat
        let banding
        let riwayat
        const perkara = await executeQuery(`
            SELECT No_Perkara, Klasifikasi_Perkara, Tanggal_Register, Jenis, PE.Id_Pengadilan, Nama_Pengadilan, Tingkatan
            FROM PERKARA P
            JOIN PENGADILAN PE ON P.Id_Pengadilan = PE.Id_Pengadilan
            WHERE No_Perkara = '${context.query.no_perkara}'
        `);

        if(context.params!.tipe === "PIDANA" && typeof context.query.no_perkara === "string" ) {
            data = await executeQuery(`
                SELECT Tuntutan, Dakwaan
                FROM PIDANA P 
                WHERE P.No_Perkara = '${context.query.no_perkara}'
            `)

            saksi = await executeQuery(`
                SELECT NIK, Hubungan, Alamat, Nama 
                FROM SAKSI S JOIN PIDANA P ON P.No_Perkara = S.No_Perkara 
                WHERE S.No_Perkara = '${context.query.no_perkara}'    
            `)

            jaksa = await executeQuery(`
                SELECT M.NIP, Nama, NoTelp, Kejaksaan 
                FROM MENJAKSAI M
                JOIN JAKSA_PENUNTUN_UMUM J ON M.NIP = J.NIP
                WHERE M.No_Perkara = '${context.query.no_perkara}'
            `)

            terdakwa = await executeQuery(`
                SELECT T.Id_SubjekHukum, P.NIK AS [NIP/NIK], Nama, Alamat
                FROM MENUNTUT M
                JOIN TERDAKWA T ON T.Id_SubjekHukum = M.Id_SubjekHukum
                JOIN SUBJEK_HUKUM SH ON SH.Id_SubjekHukum = T.Id_SubjekHukum
                JOIN PERSEORANGAN P ON P.Id_SubjekHukum = T.Id_SubjekHukum
                WHERE M.No_Perkara = '${context.query.no_perkara}'
                UNION
                SELECT T.Id_SubjekHukum, BH.NIB AS [NIP/NIK], Nama, Alamat
                FROM MENUNTUT M
                JOIN TERDAKWA T ON T.Id_SubjekHukum = M.Id_SubjekHukum
                JOIN SUBJEK_HUKUM SH ON SH.Id_SubjekHukum = T.Id_SubjekHukum
                JOIN BADAN_HUKUM BH ON BH.Id_SubjekHukum = T.Id_SubjekHukum
                WHERE M.No_Perkara = '${context.query.no_perkara}' 
            `)
            
            barangBukti = await executeQuery(`
                SELECT B.Kd_Berkas, TanggalDiajukan, Deskripsi, Objek
                FROM BERKAS B
                JOIN BARANG_BUKTI BB ON BB.Kd_Berkas = B.Kd_Berkas
                WHERE B.No_Perkara = '${context.query.no_perkara}'
            `)

            suratPelimpahan = await executeQuery(`
                SELECT B.Kd_Berkas, TanggalDiajukan, Nomor_Surat, Tanggal_Pelimpahan
                FROM BERKAS B
                JOIN SURAT_PELIMPAHAN SP ON SP.Kd_Berkas = B.Kd_Berkas
                WHERE B.No_Perkara = '${context.query.no_perkara}'
            `)

            notaPembelaan = await executeQuery(`
                SELECT B.Kd_Berkas, TanggalDiajukan, Isi, Argumen_Hukum
                FROM BERKAS B
                JOIN NOTA_PEMBELAAN NP ON NP.Kd_Berkas = B.Kd_Berkas
                WHERE B.No_Perkara = '${context.query.no_perkara}'
            `)

            notaTanggapan = await executeQuery(`
                SELECT B.Kd_Berkas, TanggalDiajukan, Isi, Penilaian
                FROM BERKAS B
                JOIN NOTA_TANGGAPAN NT ON NT.Kd_Berkas = B.Kd_Berkas
                WHERE B.No_Perkara = '${context.query.no_perkara}'
            `)

            putusan = await executeQuery(`
                SELECT
                    PP.No_Putusan,
                    PP.Tanggal_Putusan,
                    PP.Amar_Putusan,
                    PP.Status_Putusan,
                    PP.Id_SubjekHukum,
                    COALESCE(PSO.Nama, BHO.Nama) AS Nama_Terdakwa,
                    SH.jenis
                FROM PUTUSAN_PIDANA PP
                JOIN SUBJEK_HUKUM SH ON PP.Id_SubjekHukum = SH.Id_SubjekHukum
                LEFT JOIN PERSEORANGAN PSO ON PP.Id_SubjekHukum = PSO.Id_SubjekHukum
                LEFT JOIN BADAN_HUKUM BHO ON PP.Id_SubjekHukum = BHO.Id_SubjekHukum
                WHERE PP.No_Perkara = '${context.query.no_perkara}'
            `)

            advokat = await executeQuery(`
                SELECT M.NIA, A.Nama, A.Nama_Instansi, A.NoTelp, COALESCE(BH.Nama, P.Nama) AS Nama_Terdakwa
                FROM MEREPRESENTASIKAN M
                JOIN ADVOKAT A ON M.NIA = A.NIA
                JOIN MENUNTUT ME ON M.Id_SubjekHukum = ME.Id_SubjekHukum 
                LEFT JOIN PERSEORANGAN P ON ME.Id_SubjekHukum = P.Id_SubjekHukum
                LEFT JOIN BADAN_HUKUM BH ON ME.Id_SubjekHukum = BH.Id_SubjekHukum
                WHERE ME.No_Perkara = '${context.query.no_perkara}'
            `)
        }

        sidang = await executeQuery(`
            SELECT No_Sidang, Tanggal_Sidang, Agenda, Ruang, Waktu
            FROM SIDANG S
            JOIN PERKARA P ON P.No_Perkara = S.No_Perkara
            WHERE S.No_Perkara = '${context.query.no_perkara}'
         `)

        riwayat = await executeQuery(`
            SELECT No_Surat, Tanggal, Tahapan, Proses
            FROM RIWAYAT
            WHERE No_Perkara = '${context.query.no_perkara}'
        `)

        hakim = await executeQuery(`
            SELECT M.NIP, Posisi_Hakim, Nama, Gol
            FROM MENGURUSI M
            JOIN HAKIM H ON H.NIP = M.NIP
            WHERE M.No_Perkara = '${context.query.no_perkara}'
        `)

        banding = await executeQuery(`
            SELECT B.No_Perkara, B.Id_Banding, B.Amar_Banding, B.Tanggal_Banding, B.Id_Pengadilan_Banding, P.Nama_Pengadilan
            FROM BANDING B
            JOIN PENGADILAN P ON B.Id_Pengadilan_Banding = P.Id_Pengadilan
            WHERE No_Perkara = '${context.query.no_perkara}'
        `)

        let penggugat;
        let tergugat;
        let mediasi;
        if (context.params!.tipe === "PERDATA"  && typeof context.query.no_perkara === "string" ) {
            data = await executeQuery(`
                SELECT Petitum, Prodeo
                FROM PERDATA P 
                WHERE P.No_Perkara = '${context.query.no_perkara}'
            `)
                
            penggugat = await executeQuery(`
                SELECT D.Id_SubjekHukum, COALESCE(P.Nama, BH.Nama) AS Nama_Penggugat, Alamat, COALESCE(P.NIK, BH.NIB) AS [NIK/NIB] , jenis
                FROM DIAJUKAN D
                JOIN PENGGUGAT T ON T.Id_SubjekHukum = D.Id_SubjekHukum
                JOIN SUBJEK_HUKUM SH ON SH.Id_SubjekHukum = T.Id_SubjekHukum
                LEFT JOIN PERSEORANGAN P ON P.Id_SubjekHukum = T.Id_SubjekHukum
                LEFT JOIN BADAN_HUKUM BH ON P.Id_SubjekHukum = BH.Id_SubjekHukum
                WHERE No_Perkara = '${context.query.no_perkara}'
            `)

            advokat = await executeQuery(`
                SELECT M.NIA, A.Nama, A.Nama_Instansi, A.NoTelp, COALESCE(BH.Nama, P.Nama) AS Nama_Pihak
                FROM MEREPRESENTASIKAN M
                JOIN ADVOKAT A ON M.NIA = A.NIA 
                JOIN DIAJUKAN ME ON M.Id_SubjekHukum = ME.Id_SubjekHukum 
                LEFT JOIN PERSEORANGAN P ON ME.Id_SubjekHukum = P.Id_SubjekHukum
                LEFT JOIN BADAN_HUKUM BH ON ME.Id_SubjekHukum = BH.Id_SubjekHukum
                WHERE ME.No_Perkara = '${context.query.no_perkara}'
                UNION
                SELECT M.NIA, A.Nama, A.Nama_Instansi, A.NoTelp, COALESCE(BH.Nama, P.Nama) AS Nama_Pihak
                FROM MEREPRESENTASIKAN M
                JOIN ADVOKAT A ON M.NIA = A.NIA
                JOIN DIAJUKAN ME ON M.Id_SubjekHukum = ME.Id_SubjekHukum 
                LEFT JOIN PERSEORANGAN P ON ME.Id_SubjekHukum = P.Id_SubjekHukum
                LEFT JOIN BADAN_HUKUM BH ON ME.Id_SubjekHukum = BH.Id_SubjekHukum
                WHERE ME.No_Perkara = '${context.query.no_perkara}'
            `)

            tergugat = await executeQuery(`
                SELECT D.Id_SubjekHukum, COALESCE(P.Nama, BH.Nama) AS Nama_Tergugat, Alamat, COALESCE(P.NIK, BH.NIB) AS [NIK/NIB], jenis
                FROM DIGUGAT D
                JOIN TERGUGAT T ON T.Id_SubjekHukum = D.Id_SubjekHukum
                JOIN SUBJEK_HUKUM SH ON T.Id_SubjekHukum = SH.Id_SubjekHukum
                LEFT JOIN PERSEORANGAN P ON T.Id_SubjekHukum = P.Id_SubjekHukum
                LEFT JOIN BADAN_HUKUM BH ON T.Id_SubjekHukum = BH.Id_SubjekHukum
                WHERE No_Perkara = '${context.query.no_perkara}'
            `)
                
            putusan = await executeQuery(`
                SELECT No_Putusan, Tanggal_Putusan, Nilai_Ganti, Amar_Putusan, Verstek, Status_Putusan, Tanggal_Minustasi, Sumber_Hukum
                FROM PUTUSAN_PERDATA
                WHERE No_Perkara = '${context.query.no_perkara}'
            `)

            mediasi = await executeQuery(`
                SELECT No_Surat, Nama_Mediator, Hasil_Mediasi, Tanggal_Mulai, Tanggal_Hasil, Status_Mediator
                FROM MEDIASI
                WHERE No_Perkara = '${context.query.no_perkara}'
            `)
        }

        return { 
            props: { 
                data, 
                perkara: JSON.stringify(perkara) || "[]",
                saksi: JSON.stringify(saksi) || "[]", 
                sidang: JSON.stringify(sidang) || "[]",
                jaksa: JSON.stringify(jaksa) || "[]",
                terdakwa: JSON.stringify(terdakwa) || "[]",
                barangBukti: JSON.stringify(barangBukti) || "[]",
                suratPelimpahan: JSON.stringify(suratPelimpahan) || "[]",
                notaPembelaan: JSON.stringify(notaPembelaan) || "[]",
                notaTanggapan: JSON.stringify(notaTanggapan) || "[]",
                
                penggugat: JSON.stringify(penggugat) || "[]",
                tergugat: JSON.stringify(tergugat) || "[]",
                mediasi: JSON.stringify(mediasi) || "[]",
                putusan: JSON.stringify(putusan) || "[]",
                
                hakim: JSON.stringify(hakim) || "[]",
                advokat: JSON.stringify(advokat) || "[]",
                riwayat: JSON.stringify(riwayat) || "[]",
                banding: JSON.stringify(banding) || "[]",
                isPidana: context.params!.tipe === "PIDANA",

                noPerkara: context.query.no_perkara,
            } 
        }
    } catch (error) {
        return { notFound: true, saksi: null, sidang: null }
    }
  }) satisfies GetServerSideProps<{}>


type TabsData = {
    key: string,
    columns: FormType[]
    addDataEndpoint: string,
    modifyKey: string,
    prefilledValue?: { [k: string]: string }
}

const IndividualTableWithAdd = (props: { data: any[], addDataColumns: FormType[], addDataEndpoint: string, modifyKey: string, prefilledValue?: { [k: string]: string } }) => {
    const [addDataColumns, setAddDataColumns] = useState(props.addDataColumns)
    const router = useRouter()
    const refreshData = () => router.replace(router.asPath);
    const onSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault()
        const form = new FormData(e.target as HTMLFormElement)
        const obj = Object.fromEntries(form.entries());
        // if(Array.isArray(props.prefilledValueFromTableKey)) {
        //     for (const key of props.prefilledValueFromTableKey) {
        //         obj[key] = props.data[0][key]
        //     }
        // }
        // console.log(props.prefilledValueFromTableKey,obj, props)
        await fetchInsert({...obj, ...props.prefilledValue}, props.addDataEndpoint)
        refreshData()
    }

    // TODO: HANDLE ERROR
    const init = async () => {
        const copy = [...addDataColumns]
        for (const i in copy) {
            const data = copy[i]
            if(data.selectDataUrl) {
                // SERVER SHOULD RETURN FORMATTED VALUE of FormSelectData[]
               const res = await fetch(data.selectDataUrl)
               copy[i].selectData = (await res.json()).message
            }
        }
        setAddDataColumns(copy)
    }

    useEffect(() => {
        init()
    }, [])

    return  (
        <Box m="md">
            <Button 
                leftIcon={<IconPlus />} 
                onClick={() => 
                    modals.open({
                        title: 'Tambah Data',
                        size: "xl",
                        children: (
                        <Box component="form" onSubmit={onSubmit}>
                            {addDataColumns.filter((v,i ) => !(Object.keys(props.prefilledValue ?? {}) || []).includes(v.key)).map((row, i) => (
                                <Box key={i}>
                                    <RenderForm form={row} />
                                    <Space h="md" />
                                </Box>
                            ))}
                            
                            <Button fullWidth type="submit" mt="md">
                                Submits
                            </Button>
                        </Box>
                        )
                    })
                }
            >
                Tambah Data
            </Button>
            <TabelData 
                noTitle 
                data={props.data} 
                judul="" 

                canDelete
                deleteEndpoint={props.addDataEndpoint}
                deleteKey={props.modifyKey}
                
                canEdit
                editEndpoint={props.addDataEndpoint}
                editKey={props.modifyKey}
                editDataColumns={addDataColumns}
                prefilledEditDataColumns={props.prefilledValue}
            />
        </Box>
    )
}

const Hakim: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>>  = (props) => {
    const router = useRouter()

    const perkara = useMemo(() => JSON.parse(props.perkara) as any[], [])

    const pidanaTabs: TabsData[] = useMemo(() =>  [
        {
            "key": "saksi",
            "columns": [
                {
                    key: "NIK",
                    type: "text"
                },
                {
                    key: "Hubungan",
                    type: "text"
                },
                {
                    key: "Alamat",
                    type: "text"
                },
                {
                    key: "Nama",
                    type: "text"
                },
                {
                    key: "No_Perkara",
                    type: "text"
                },
            ],
            "addDataEndpoint": "/api/perkara/saksi",
            "modifyKey": "NIK"
        },
        {
            "key": "jaksa",
            "columns": [
                {
                    key: "NIP",
                    type: "select",
                    selectDataUrl: "/api/list-jaksa"
                },
            ],
            "addDataEndpoint": "/api/perkara/menjaksai",
            "modifyKey": "NIP"
        },
        {
            "key": "terdakwa",
            "columns": [
                {
                    key: "Id_SubjekHukum",
                    type: "text"
                },
                {
                    key: "Nama",
                    type: "text"
                },
                {
                    key: "Alamat",
                    type: "text"
                },
                {
                    key: "Jenis",
                    type: "select",
                    selectData: [
                        {
                            label: "Perseorangan",
                            name: "Perseorangan"
                        },
                        {
                            label: "Badan Hukum",
                            name: "Badan Hukum"
                        },
                    ],
                    childFormOnCondition: {
                        "Badan Hukum": [
                            {
                                key: "NIB",
                                type: "text"
                            },
                        ],
                        "Perseorangan": [
                            {
                                key: "NIK",
                                type: "text"
                            }
                        ],
                    }
                }
            ],
            "addDataEndpoint": "/api/perkara/terdakwa",
            "modifyKey": "Id_SubjekHukum"
        },
        {
            "key": "barangBukti",
            "columns": [
                {
                    key: "Kd_Berkas",
                    type: "text"
                },
                {
                    key: "Tanggal_Diajukan",
                    type: "datetime"
                },
                {
                    key: "Deskripsi",
                    type: "textarea"
                },
                {
                    key: "Objek",
                    type: "text"
                },
            ],
            "addDataEndpoint": "/api/perkara/barangbukti",
            "modifyKey": "Kd_Berkas"
        },
        {
            "key": "suratPelimpahan",
            "columns": [
                {
                    key: "Kd_Berkas",
                    type: "text"
                },
                {
                    key: "Tanggal_Diajukan",
                    type: "datetime"
                },
                {
                    key: "Nomor_Surat",
                    type: "text"
                },
                {
                    key: "Tanggal_Pelimpahan",
                    type: "datetime"
                },
            ],
            "addDataEndpoint": "/api/perkara/suratpelimpahan",
            "modifyKey": "Kd_Berkas"
        },
        {
            "key": "notaPembelaan",
            "columns": [
                {
                    key: "Kd_Berkas",
                    type: "text"
                },
                {
                    key: "Tanggal_Diajukan",
                    type: "datetime"
                },
                {
                    key: "Isi",
                    type: "textarea"
                },
                {
                    key: "Argumen_Hukum",
                    type: "text"
                },
            ],
            "addDataEndpoint": "/api/perkara/notapembelaan",
            "modifyKey": "Kd_Berkas"
        },
        {
            "key": "notaTanggapan",
            "columns": [
                {
                    key: "Kd_Berkas",
                    type: "text"
                },
                {
                    key: "Tanggal_Diajukan",
                    type: "datetime"
                },
                {
                    key: "Isi",
                    type: "textarea"
                },
                {
                    key: "Penilaian",
                    type: "textarea"
                },
            ],
            "addDataEndpoint": "/api/perkara/notatanggapan",
            "modifyKey": "Kd_Berkas"
        },
        {
            "key": "putusan",
            "columns": [
                {
                    key: "No_Putusan",
                    type: "text"
                },
                {
                    key: "Tanggal_Putusan",
                    type: "datetime"
                },
                {
                    key: "Amar_Putusan",
                    type: "textarea"
                },
                {
                    key: "Status_Putusan",
                    type: "text"
                },
                {
                    key: "Id_SubjekHukum",
                    type: "select",
                    selectDataUrl: `/api/perkara/advokat?no_perkara=${props.noPerkara}`
                },
            ],
            "addDataEndpoint": "/api/perkara/putusan_pidana",
            "modifyKey": "No_Putusan"
        }
    ] ,[]) 
    
    const perdataTabs: TabsData[] = useMemo(() => [
        {
            "key": "penggugat",
            "columns": [
                {
                    key: "Id_SubjekHukum",
                    type: "text"
                },
                {
                    key: "Nama",
                    type: "text"
                },
                {
                    key: "Alamat",
                    type: "text"
                },
                {
                    key: "Jenis",
                    type: "select",
                    selectData: [
                        {
                            label: "Perseorangan",
                            name: "Perseorangan"
                        },
                        {
                            label: "Badan Hukum",
                            name: "Badan Hukum"
                        },
                    ],
                    childFormOnCondition: {
                        "Badan Hukum": [
                            {
                                key: "NIB",
                                type: "text"
                            },
                        ],
                        "Perseorangan": [
                            {
                                key: "NIK",
                                type: "text"
                            }
                        ],
                    }
                }
            ],
            "addDataEndpoint": "/api/perkara/penggugat",
            "modifyKey": "Id_SubjekHukum"
        },
        {
            "key": "tergugat",
            "columns": [
                {
                    key: "Id_SubjekHukum",
                    type: "text"
                },
                {
                    key: "Nama",
                    type: "text"
                },
                {
                    key: "Alamat",
                    type: "text"
                },
                {
                    key: "Jenis",
                    type: "select",
                    selectData: [
                        {
                            label: "Perseorangan",
                            name: "Perseorangan"
                        },
                        {
                            label: "Badan Hukum",
                            name: "Badan Hukum"
                        },
                    ],
                    childFormOnCondition: {
                        "Badan Hukum": [
                            {
                                key: "NIB",
                                type: "text"
                            },
                        ],
                        "Perseorangan": [
                            {
                                key: "NIK",
                                type: "text"
                            }
                        ],
                    }
                }
            ],
            "addDataEndpoint": "/api/perkara/tergugat",
            "modifyKey": "Id_SubjekHukum"
        },
        {
            "key": "mediasi",
            "columns": [
                {
                    key: "No_Surat",
                    type: "text"
                },
                {
                    key: "Nama_Mediator",
                    type: "text"
                },
                {
                    key: "Hasil_Mediasi",
                    type: "textarea"
                },
                {
                    key: "Tanggal_Mulai",
                    type: "datetime"
                },
                {
                    key: "Tanggal_Hasil",
                    type: "datetime"
                },
                {
                    key: "Status_Mediator",
                    type: "text"
                },
            ],
            "addDataEndpoint": "/api/perkara/mediasi",
            "modifyKey": "No_Surat"
        },
        {
            "key": "putusan",
            "columns": [
                {
                    key: "No_Putusan",
                    type: "text"
                },
                {
                    key: "Tanggal_Putusan",
                    type: "datetime"
                },
                {
                    key: "Nilai_Ganti",
                    type: "text"
                },
                {
                    key: "Amar_Putusan",
                    type: "textarea"
                },
                {
                    key: "Verstek",
                    type: "text"
                },
                {
                    key: "Status_Putusan",
                    type: "text"
                },
                {
                    key: "Tanggal_Minustasi",
                    type: "datetime"
                },
                {
                    key: "Sumber_Hukum",
                    type: "text"
                },
            ],
            "addDataEndpoint": "/api/perkara/putusan_perdata",
            "modifyKey": "No_Putusan"
        }
    ], [])
    
    const bothTabs: TabsData[] = useMemo(() => [
        {
            "key": "hakim",
            "columns": [
                {
                    key: "NIP",
                    type: "select",
                    selectDataUrl: `/api/hakim?no_perkara=${props.noPerkara}`
                },
                {
                    key: "Posisi_Hakim",
                    type: "select",
                    selectData: [
                        {
                            label: "Hakim Ketua",
                            name: "Hakim Ketua"
                        },
                        {
                            label: "Hakim Anggota",
                            name: "Hakim Anggota"
                        },
                    ],
                },
            ],
            "addDataEndpoint": "/api/perkara/mengurusi",
            "modifyKey": "NIP"
        },
        {
            "key": "advokat",
            "columns": [
                {
                    key: "NIA",
                    type: "text"
                },
                {
                    key: "Nama",
                    type: "text"
                },
                {
                    key: "Nama_Instansi",
                    type: "text"
                },
                {
                    key: "NoTelp",
                    type: "text"
                },
                {
                    key: "Id_SubjekHukum",
                    type: "select",
                    selectDataUrl: `/api/perkara/advokat?no_perkara=${props.noPerkara}`
                },
    
            ],
            "addDataEndpoint": "/api/perkara/advokat",
            "modifyKey": "NIA",
        },
        {
            "key": "riwayat",
            "columns": [
                {
                    key: "No_Surat",
                    type: "text"
                },
                {
                    key: "Tanggal",
                    type: "datetime"
                },
                {
                    key: "Tahapan",
                    type: "text"
                },
                {
                    key: "Proses",
                    type: "text"
                },
            ],
            "addDataEndpoint": "/api/perkara/riwayat",
            "modifyKey": "No_Surat"
        },
        {
            "key": "sidang",
            "columns": [
                {
                    key: "No_Sidang",
                    type: "text"
                },
                {
                    key: "Tanggal_Sidang",
                    type: "datetime"
                },
                {
                    key: "Agenda",
                    type: "text"
                },
                {
                    key: "Ruang",
                    type: "text"
                },
                {
                    key: "Waktu",
                    type: "time"
                },
                {
                    key: "No_Perkara",
                    type: "text"
                },
            ],
            "addDataEndpoint": "/api/perkara/sidang",
            "modifyKey": "No_Sidang"
        },
        {
            "key": "banding",
            "columns": [
                {
                    key: "Id_Banding",
                    type: "textarea",
                },
                {
                    key: "Amar_Banding",
                    type: "textarea"
                },
                {
                    key: "Tanggal_Banding",
                    type: "datetime"
                },
                {
                    key: "Id_Pengadilan_Banding",
                    type: "text",
                    // selectDataUrl: "api/list-pengadilan1"
                },
            ],
            "addDataEndpoint": "/api/perkara/banding",
            "modifyKey": "Id_Banding",
            // TODO: FIXME
            "prefilledValue": {
                // @ts-ignore
                "Jenis": perkara[0].Jenis,
                // @ts-ignore
                "Klasifikasi_Perkara": perkara[0].Klasifikasi_Perkara,
                // @ts-ignore
                "Tanggal_Register": perkara[0].Tanggal_Register
            }
        },
    ], [])


    return (
        <>
            <Box sx={{ display: "flex", justifyContent: "center" }} mb={10}>
                <Title order={3}>{props.noPerkara}</Title>
            </Box>

            <Space h="xl" style={{ height: "60px" }} />
            {/* @ts-ignore */}
            <TabelData tabelProps={{ withoutDefaultToolbar: true }} noTitle data={perkara} judul='' />

            <Space h="xl" style={{ height: "60px" }} />
            {/* Pidana */}
           {
            props.isPidana &&  <IndividualTableWithAdd 
            // @ts-ignore
                data={props.data} 
                addDataColumns={[
                    {
                        key: "Tuntutan",
                        type: "textarea"
                    },
                    {
                        key: "Dakwaan",
                        type: "textarea"
                    },
                ]}
                addDataEndpoint={'/api/pidana'}
                prefilledValue={{
                    "No_Perkara": router.query.no_perkara as string
                }}
                modifyKey={"No_Perkara"}
            /> 
           }

            {/* Perdata */}
           {
            !props.isPidana &&  <IndividualTableWithAdd 
            // @ts-ignore
                data={props.data} 
                addDataColumns={[
                    {
                        key: "Petitum",
                        type: "textarea"
                    },
                    {
                        key: "Prodeo",
                        type: "text"
                    },
                ]}
                addDataEndpoint={'/api/perdata'}
                prefilledValue={{
                    "No_Perkara": router.query.no_perkara as string
                }}
                modifyKey={"No_Perkara"}
            /> 
           }
            
            <Space h="xl" style={{ height: "60px" }} />
            <Tabs radius="md" defaultValue={props.isPidana?"saksi": "hakim"}>
                <Tabs.List>
                    {[...(props.isPidana?pidanaTabs:perdataTabs), ...bothTabs ].map((v) => <Tabs.Tab value={v.key}>{v.key.toUpperCase()}</Tabs.Tab>)}
                </Tabs.List>
                {
                    [...(props.isPidana?pidanaTabs:perdataTabs), ...bothTabs ].map((v) => (
                        <>
                        {/* @ts-ignore TODO:FIXME */}
                        {JSON.parse(props[v.key]) && <Tabs.Panel value={v.key}> 
                            <IndividualTableWithAdd 
                                // @ts-ignore
                                data={JSON.parse(props[v.key])} 
                                addDataColumns={v.columns}
                                addDataEndpoint={v.addDataEndpoint}
                                prefilledValue={{
                                    "No_Perkara": router.query.no_perkara as string,
                                    ...v.prefilledValue
                                }}
                                modifyKey={v.modifyKey}
                            /> 
                        
                        </Tabs.Panel>}
                        </>
                    ))
                }
                 
            </Tabs>
        </>
    )
}

export default Hakim

