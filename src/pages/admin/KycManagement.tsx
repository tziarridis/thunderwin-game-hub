
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { KycRequest, KycStatus, KycDocumentType } from '@/types';
import { Eye, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

// Mock service
const mockKycService = {
  getAllKycRequests: async (): Promise<KycRequest[]> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return [
      {
        id: '1',
        user_id: 'user-1',
        document_type: KycDocumentType.PASSPORT,
        document_front_url: 'https://example.com/doc1.jpg',
        document_back_url: 'https://example.com/doc1-back.jpg',
        status: KycStatus.PENDING,
        documents: [
          {
            id: 'doc-1',
            type: KycDocumentType.PASSPORT,
            front_url: 'https://example.com/doc1.jpg',
            back_url: 'https://example.com/doc1-back.jpg',
            status: KycStatus.PENDING
          }
        ],
        created_at: '2024-01-15T00:00:00Z',
        updated_at: '2024-01-15T00:00:00Z'
      },
      {
        id: '2',
        user_id: 'user-2',
        document_type: KycDocumentType.NATIONAL_ID,
        document_front_url: 'https://example.com/doc2.jpg',
        document_back_url: 'https://example.com/doc2-back.jpg',
        status: KycStatus.APPROVED,
        documents: [
          {
            id: 'doc-2',
            type: KycDocumentType.NATIONAL_ID,
            front_url: 'https://example.com/doc2.jpg',
            back_url: 'https://example.com/doc2-back.jpg',
            status: KycStatus.APPROVED
          }
        ],
        created_at: '2024-01-14T00:00:00Z',
        updated_at: '2024-01-14T00:00:00Z'
      },
      {
        id: '3',
        user_id: 'user-3',
        document_type: KycDocumentType.DRIVER_LICENSE,
        document_front_url: 'https://example.com/doc3.jpg',
        document_back_url: 'https://example.com/doc3-back.jpg',
        status: KycStatus.RESUBMIT_REQUIRED,
        documents: [
          {
            id: 'doc-3',
            type: KycDocumentType.DRIVER_LICENSE,
            front_url: 'https://example.com/doc3.jpg',
            back_url: 'https://example.com/doc3-back.jpg',
            status: KycStatus.RESUBMIT_REQUIRED
          }
        ],
        created_at: '2024-01-13T00:00:00Z',
        updated_at: '2024-01-13T00:00:00Z'
      }
    ];
  },

  updateKycStatus: async (requestId: string, status: KycStatus) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { id: requestId, status };
  }
};

const KycManagement = () => {
  const { data: kycRequests, isLoading, error, refetch } = useQuery<KycRequest[], Error>({
    queryKey: ['kycRequests'],
    queryFn: mockKycService.getAllKycRequests,
  });

  const handleStatusUpdate = async (requestId: string, newStatus: KycStatus) => {
    try {
      await mockKycService.updateKycStatus(requestId, newStatus);
      refetch();
    } catch (error) {
      console.error('Error updating KYC status:', error);
    }
  };

  const getStatusBadgeVariant = (status: KycStatus) => {
    switch (status) {
      case KycStatus.APPROVED:
        return 'default';
      case KycStatus.REJECTED:
        return 'destructive';
      case KycStatus.PENDING:
        return 'secondary';
      case KycStatus.RESUBMIT_REQUIRED:
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status: KycStatus) => {
    switch (status) {
      case KycStatus.APPROVED:
        return <CheckCircle className="h-4 w-4" />;
      case KycStatus.REJECTED:
        return <XCircle className="h-4 w-4" />;
      case KycStatus.RESUBMIT_REQUIRED:
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Eye className="h-4 w-4" />;
    }
  };

  const columns = [
    {
      accessorKey: 'user_id',
      header: 'User ID',
    },
    {
      accessorKey: 'document_type',
      header: 'Document Type',
      cell: ({ row }: any) => (
        <Badge variant="outline">
          {row.original.document_type.replace('_', ' ').toUpperCase()}
        </Badge>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => (
        <div className="flex items-center space-x-2">
          {getStatusIcon(row.original.status)}
          <Badge variant={getStatusBadgeVariant(row.original.status)}>
            {row.original.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'Submitted',
      cell: ({ row }: any) => new Date(row.original.created_at).toLocaleDateString(),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleStatusUpdate(row.original.id, KycStatus.APPROVED)}
            disabled={row.original.status === KycStatus.APPROVED}
          >
            Approve
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleStatusUpdate(row.original.id, KycStatus.REJECTED)}
            disabled={row.original.status === KycStatus.REJECTED}
          >
            Reject
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">KYC Management</h1>
        <p className="text-muted-foreground">Review and manage user verification requests</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>KYC Requests</CardTitle>
          <CardDescription>All user verification requests and their status</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading KYC requests...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              Error loading KYC requests: {error.message}
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={kycRequests || []}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default KycManagement;
